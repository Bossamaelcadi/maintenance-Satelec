import type { TDocumentDefinitions, Content, ContentStack } from 'pdfmake/interfaces';
import { date } from 'quasar';

// A reference to pdfMake library instance, initialized to null.
// It will be dynamically imported and assigned when needed.
import type * as pdfMake from 'pdfmake/build/pdfmake';
let pdfMakeInstance: typeof pdfMake | null = null;

// Load pdfmake and its fonts
async function initPdfMake() {
  if (!pdfMakeInstance) {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    await import('pdfmake/build/vfs_fonts');
    pdfMakeInstance = pdfMakeModule;
  }
  return pdfMakeInstance;
}

// Type for the PDF document
type TCreatedPdf = {
  download: (filename: string) => void;
  // Add other methods as needed
};

export interface MaintenanceData {
  client?: string;
  site?: string;
  photos?: Array<File | string | null>;
  photo?: File | string | null; // Keep for backward compatibility
  remarques?: string;
  signature?: string; // Base64 string représentant l'image de la signature
  controles: Array<{
    prestation: string;
    status?: number;
    textValue?: string;
    type: 'toggle' | 'text';
  }>;
}

interface TransformateurData extends MaintenanceData {
  nomTransformateur?: string;
  puissance?: string;
}

interface PosteHTBTData extends MaintenanceData {
  nomPoste?: string;
  nombreCellules?: number;
  typeCellule?: string;
}

interface TGBTData extends MaintenanceData {
  nomTGBT?: string;
}

interface TDData extends MaintenanceData {
  nomTD?: string;
}

interface BorneRechargeData extends MaintenanceData {
  lieuIntervention?: string;
  typeBorne?: string;
  numeroBorne?: number;
}

interface BorneIRVEData extends MaintenanceData {
  client?: string;
  site?: string;
  
  // Interrupteur section
  interrupteurIntensiteVolts?: number;
  interrupteurLk3?: string;
  interrupteurLk1?: string;
  interrupteurPhotos?: Array<File | string | null>;
  
  // Cable section
  cableLongueur?: string;
  cableSection?: string;
  cableType?: string;
  cableModePose?: string;
  cableNbCircuitAdjacent?: string;
  cablePhotos?: Array<File | string | null>;
  
  // Borne section
  bornePuissance?: number;
  bornePhotos?: Array<File | string | null>;
}

const getStatusText = (status: number | undefined) => {
  if (status === undefined) return 'Non vérifié';
  return status === 1 ? 'Conforme' : 'Non conforme';
};

const getControlesTable = (controles: MaintenanceData['controles']) => {
  return {
    table: {
      headerRows: 1,
      widths: ['*', 'auto'],
      body: [
        [
          { text: 'Prestation', style: 'tableHeader' },
          { text: 'Statut', style: 'tableHeader' }
        ],
        ...controles.map(controle => [
          controle.prestation,
          controle.type === 'toggle'
            ? getStatusText(controle.status)
            : controle.textValue || ''
        ])
      ]
    },
    layout: 'lightHorizontalLines'
  };
};

const getCommonContent = async (data: MaintenanceData) => {
  const content: TDocumentDefinitions['content'] = [];
  
  // Handle photos array (new method)
  if (data.photos && data.photos.length > 0) {
    for (let i = 0; i < Math.min(data.photos.length, 2); i++) { // Limit to 2 photos
      const photo = data.photos[i];
      if (!photo) continue;
      
      let imageDataUrl: string;
      if (photo instanceof File) {
        const reader = new FileReader();
        imageDataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photo);
        });
      } else {
        imageDataUrl = photo;
      }
      
      content.push({
        stack: [
          {
            image: imageDataUrl,
            width: 150,
            alignment: 'center'
          },
          {
            text: `Photo ${i + 1} de l'intervention`,
            alignment: 'center',
            italics: true,
            margin: [0, 5, 0, 20]
          }
        ],
        margin: [0, 10, 0, 20]
      });
    }
  }
  // Handle single photo (for backward compatibility)
  else if (data.photo) {
    let imageDataUrl: string;
    if (data.photo instanceof File) {
      const reader = new FileReader();
      imageDataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(data.photo as File);
      });
    } else {
      // If photo is already a base64 string, use it directly
      imageDataUrl = data.photo;
    }

    content.push({
      unbreakable: true,
      stack: [
        {
          image: imageDataUrl,
          width: 150,
          alignment: 'center'
        },
        {
          text: 'Photo de l\'intervention',
          alignment: 'center',
          italics: true,
          margin: [0, 5, 0, 0]
        }
      ],
      margin: [0, 10, 0, 20]
    });
  }

  if (data.remarques) {
    content.push(
      { text: 'Remarques :', style: 'subheader', margin: [0, 20, 0, 10] },
      { text: data.remarques, margin: [0, 0, 0, 20] }
    );
  }
  
  // Ajouter la signature si elle existe
  if (data.signature) {
    content.push(
      { text: 'Signature :', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        image: data.signature,
        width: 200,
        alignment: 'left',
        margin: [0, 0, 0, 20]
      }
    );
  }

  return content;
};

export const generatePDF = async (data: MaintenanceData, type: 'transformateur' | 'poste-htbt' | 'tgbt' | 'td' | 'borne-recharge' | 'borne-irve') => {
  await savePDFHistory(data, type);
  
  switch (type) {
    case 'transformateur':
      return generateTransformateurPDF(data);
    case 'poste-htbt':
      return generatePosteHTBTPDF(data);
    case 'tgbt':
      return generateTGBTPDF(data);
    case 'td':
      return generateTDPDF(data as TDData);
    case 'borne-recharge':
      return generateBorneRechargePDF(data);
    case 'borne-irve':
      return generateBorneIRVEPDF(data);
    default:
      throw new Error('Type de document non supporté');
  }
};

const savePDFHistory = async (data: MaintenanceData, type: 'transformateur' | 'poste-htbt' | 'tgbt' | 'td' | 'borne-recharge' | 'borne-irve') => {
  // Convert File to base64 if it exists
  const dataToSave = { ...data };
  
  // Convert photo to base64 (for backward compatibility)
  if (dataToSave.photo instanceof File) {
    const reader = new FileReader();
    dataToSave.photo = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(dataToSave.photo as File);
    });
  }
  
  // Convert photos array to base64 if they exist
  if (dataToSave.photos && dataToSave.photos.length > 0) {
    const convertedPhotos = [];
    for (const photo of dataToSave.photos) {
      if (photo instanceof File) {
        const reader = new FileReader();
        const base64Photo = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photo);
        });
        convertedPhotos.push(base64Photo);
      } else {
        convertedPhotos.push(photo);
      }
    }
    dataToSave.photos = convertedPhotos;
  }
  
  // Traiter les tableaux d'images spécifiques à la borne IRVE
  // Fonction utilitaire pour convertir un tableau de photos
  const convertPhotoArray = async (photoArray: Array<File | string | null> | undefined) => {
    if (!photoArray || photoArray.length === 0) return photoArray;
    
    const convertedArray = [];
    for (const photo of photoArray) {
      if (photo instanceof File) {
        const reader = new FileReader();
        const base64Photo = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photo);
        });
        convertedArray.push(base64Photo);
      } else {
        convertedArray.push(photo);
      }
    }
    return convertedArray;
  };
  
  // Convertir les tableaux de photos pour la borne IRVE
  if (type === 'borne-irve') {
    const borneIRVEData = dataToSave as unknown as BorneIRVEData;
    
    if (borneIRVEData.interrupteurPhotos) {
      const convertedPhotos = await convertPhotoArray(borneIRVEData.interrupteurPhotos);
      if (convertedPhotos) {
        borneIRVEData.interrupteurPhotos = convertedPhotos;
      }
    }
    
    if (borneIRVEData.cablePhotos) {
      const convertedPhotos = await convertPhotoArray(borneIRVEData.cablePhotos);
      if (convertedPhotos) {
        borneIRVEData.cablePhotos = convertedPhotos;
      }
    }
    
    if (borneIRVEData.bornePhotos) {
      const convertedPhotos = await convertPhotoArray(borneIRVEData.bornePhotos);
      if (convertedPhotos) {
        borneIRVEData.bornePhotos = convertedPhotos;
      }
    }
  }
  
  const historyItem = {
    date: new Date().toISOString(),
    type,
    formData: dataToSave
  };

  const history = localStorage.getItem('pdfHistory');
  const pdfHistory = history ? JSON.parse(history) : [];
  pdfHistory.push(historyItem);
  localStorage.setItem('pdfHistory', JSON.stringify(pdfHistory));
};

export const generateTransformateurPDF = async (data: TransformateurData): Promise<TCreatedPdf> => {
  await savePDFHistory(data, 'transformateur');
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 60],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10], alignment: 'center' as const },
      subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
      tableHeader: { bold: true, fontSize: 12, color: 'black' }
    },
    info: {
      title: 'Rapport de maintenance - Transformateur',
      author: 'Satelec',
      subject: 'Maintenance Transformateur',
      creator: 'Satelec Application'
    },
    content: [
      { text: 'RAPPORT DE MAINTENANCE', style: 'header' },
      { text: 'TRANSFORMATEUR', style: 'header', margin: [0, 0, 0, 20] },
      {
        columns: [
          [
            { text: 'Client:', bold: true },
            { text: data.client || 'Non spécifié', margin: [0, 0, 0, 10] },
            { text: 'Nom du transformateur:', bold: true },
            { text: data.nomTransformateur || 'Non spécifié', margin: [0, 0, 0, 10] }
          ],
          [
            { text: 'Site:', bold: true },
            { text: data.site || 'Non spécifié', margin: [0, 0, 0, 10] },
            { text: 'Puissance:', bold: true },
            { text: data.puissance || 'Non spécifié', margin: [0, 0, 0, 10] }
          ]
        ],
        margin: [0, 0, 0, 20]
      },
      { text: 'CONTRÔLES APRÈS CONSIGNATION DU POSTE', style: 'subheader', margin: [0, 0, 0, 10] },
      getControlesTable(data.controles),
      ...await getCommonContent(data),
      {
        text: `Date d'intervention: ${date.formatDate(new Date(), 'DD/MM/YYYY')}`,
        margin: [0, 30, 0, 0],
        alignment: 'right' as const
      }
    ]
  };

  const pdfMakeInstance = await initPdfMake();
  return pdfMakeInstance.createPdf(docDefinition);
};

export const generatePosteHTBTPDF = async (data: PosteHTBTData): Promise<TCreatedPdf> => {
  await savePDFHistory(data, 'poste-htbt');
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 60],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10], alignment: 'center' as const },
      subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
      tableHeader: { bold: true, fontSize: 12, color: 'black' }
    },
    info: {
      title: 'Rapport de maintenance - Poste HT/BT',
      author: 'Satelec',
      subject: 'Maintenance Poste HT/BT',
      creator: 'Satelec Application'
    },
    content: [
      { text: 'RAPPORT DE MAINTENANCE', style: 'header' },
      { text: 'POSTE HT/BT', style: 'header', margin: [0, 0, 0, 20] },
      {
        columns: [
          [
            { text: 'Client:', bold: true },
            { text: data.client || 'Non spécifié', margin: [0, 0, 0, 10] },
            { text: 'Nom du poste:', bold: true },
            { text: data.nomPoste || 'Non spécifié', margin: [0, 0, 0, 10] }
          ],
          [
            { text: 'Site:', bold: true },
            { text: data.site || 'Non spécifié', margin: [0, 0, 0, 10] },
            { text: 'Nombre de cellules:', bold: true },
            { text: data.nombreCellules || 'Non spécifié', margin: [0, 0, 0, 10] },
            { text: 'Type de cellule:', bold: true },
            { text: data.typeCellule || 'Non spécifié', margin: [0, 0, 0, 10] }
          ]
        ],
        margin: [0, 0, 0, 20]
      },
      { text: 'CONTRÔLES APRÈS CONSIGNATION DU POSTE', style: 'subheader', margin: [0, 0, 0, 10] },
      getControlesTable(data.controles),
      ...await getCommonContent(data),
      {
        text: `Date d'intervention: ${date.formatDate(new Date(), 'DD/MM/YYYY')}`,
        margin: [0, 30, 0, 0],
        alignment: 'right' as const
      }
    ]
  };

  const pdfMakeInstance = await initPdfMake();
  return pdfMakeInstance.createPdf(docDefinition);
};

export const generateTGBTPDF = async (data: TGBTData): Promise<TCreatedPdf> => {
  await savePDFHistory(data, 'tgbt');
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 60],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10], alignment: 'center' as const },
      subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
      tableHeader: { bold: true, fontSize: 12, color: 'black' }
    },
    info: {
      title: 'Rapport de maintenance - TGBT',
      author: 'Satelec',
      subject: 'Maintenance TGBT',
      creator: 'Satelec Application'
    },
    content: [
      { text: 'RAPPORT DE MAINTENANCE', style: 'header' },
      { text: 'TABLEAU GÉNÉRAL BASSE TENSION', style: 'header', margin: [0, 0, 0, 20] },
      {
        columns: [
          [
            { text: 'Client:', bold: true },
            { text: data.client || 'Non spécifié', margin: [0, 0, 0, 10] },
            { text: 'Nom du TGBT:', bold: true },
            { text: data.nomTGBT || 'Non spécifié', margin: [0, 0, 0, 10] }
          ],
          [
            { text: 'Site:', bold: true },
            { text: data.site || 'Non spécifié', margin: [0, 0, 0, 10] }
          ]
        ],
        margin: [0, 0, 0, 20]
      },
      { text: 'CONTRÔLES APRÈS CONSIGNATION', style: 'subheader', margin: [0, 0, 0, 10] },
      getControlesTable(data.controles),
      ...await getCommonContent(data),
      {
        text: `Date d'intervention: ${date.formatDate(new Date(), 'DD/MM/YYYY')}`,
        margin: [0, 30, 0, 0],
        alignment: 'right' as const
      }
    ]
  };

  const pdfMakeInstance = await initPdfMake();
  return pdfMakeInstance.createPdf(docDefinition);
};

export const generateTDPDF = async (data: TDData): Promise<TCreatedPdf> => {
  await savePDFHistory(data, 'td');
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 60],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10], alignment: 'center' as const },
      subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
      tableHeader: { bold: true, fontSize: 12, color: 'black' }
    },
    info: {
      title: 'Rapport de maintenance - TD',
      author: 'Satelec',
      subject: 'Maintenance TD',
      creator: 'Satelec Application'
    },
    content: [
      { text: 'RAPPORT DE MAINTENANCE', style: 'header' },
      { text: 'TABLEAU DE DISTRIBUTION', style: 'header', margin: [0, 0, 0, 20] },
      {
        columns: [
          [
            { text: 'Client:', bold: true },
            { text: data.client || 'Non spécifié', margin: [0, 0, 0, 10] },
            { text: 'Nom du TD:', bold: true },
            { text: data.nomTD || 'Non spécifié', margin: [0, 0, 0, 10] }
          ],
          [
            { text: 'Site:', bold: true },
            { text: data.site || 'Non spécifié', margin: [0, 0, 0, 10] }
          ]
        ],
        margin: [0, 0, 0, 20]
      },
      { text: 'CONTRÔLES APRÈS CONSIGNATION', style: 'subheader', margin: [0, 0, 0, 10] },
      getControlesTable(data.controles),
      ...await getCommonContent(data),
      {
        text: `Date d'intervention: ${date.formatDate(new Date(), 'DD/MM/YYYY')}`,
        margin: [0, 30, 0, 0],
        alignment: 'right' as const
      }
    ]
  };

  const pdfMakeInstance = await initPdfMake();
  return pdfMakeInstance.createPdf(docDefinition);
};

export const generateBorneRechargePDF = async (data: BorneRechargeData): Promise<TCreatedPdf> => {
  await savePDFHistory(data, 'borne-recharge');
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 60],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10], alignment: 'center' as const },
      subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
      tableHeader: { bold: true, fontSize: 12, color: 'black' }
    },
    info: {
      title: 'Rapport de maintenance - Borne de Recharge',
      author: 'Satelec',
      subject: 'Maintenance Borne de Recharge',
      creator: 'Satelec Application'
    },
    content: [
      { text: 'RAPPORT DE MAINTENANCE', style: 'header' },
      { text: 'BORNE DE RECHARGE', style: 'header', margin: [0, 0, 0, 20] },
      {
        columns: [
          [
            { text: 'Lieu d\'intervention:', bold: true },
            { text: data.lieuIntervention || 'Non spécifié', margin: [0, 0, 0, 10] },
            { text: 'Type de borne:', bold: true },
            { text: data.typeBorne || 'Non spécifié', margin: [0, 0, 0, 10] }
          ],
          [
            { text: 'Numéro de la borne:', bold: true },
            { text: data.numeroBorne !== undefined ? data.numeroBorne.toString() : 'Non spécifié', margin: [0, 0, 0, 10] }
          ]
        ],
        margin: [0, 0, 0, 20]
      },
      { text: 'MAINTENANCE DE LA BORNE', style: 'subheader', margin: [0, 0, 0, 10] },
      getControlesTable(data.controles),
      ...await getCommonContent(data),
      {
        text: `Date d'intervention: ${date.formatDate(new Date(), 'DD/MM/YYYY')}`,
        margin: [0, 30, 0, 0],
        alignment: 'right' as const
      }
    ]
  };

  const pdfMakeInstance = await initPdfMake();
  return pdfMakeInstance.createPdf(docDefinition);
};

export const generateBorneIRVEPDF = async (data: BorneIRVEData): Promise<TCreatedPdf> => {
  await savePDFHistory(data, 'borne-irve');
  const pdfMake = await initPdfMake();
  if (!pdfMake) throw new Error('Failed to initialize pdfMake');

  // Common document styles and default settings
  const documentDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 60],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
        alignment: 'center' as const
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      sectionTitle: {
        fontSize: 14,
        bold: true,
        margin: [0, 15, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'black'
      }
    },
    info: {
      title: 'Rapport de maintenance - Borne IRVE',
      author: 'Satelec',
      subject: 'Maintenance Borne IRVE',
      creator: 'Satelec Application'
    },
    content: [
      { text: 'RAPPORT DE MAINTENANCE', style: 'header' },
      { text: 'BORNE IRVE', style: 'header', margin: [0, 0, 0, 20] },
      
      // Client and Site
      {
        columns: [
          [
            { text: 'Client:', bold: true },
            { text: data.client || 'Non spécifié', margin: [0, 0, 0, 10] }
          ],
          [
            { text: 'Site:', bold: true },
            { text: data.site || 'Non spécifié', margin: [0, 0, 0, 10] }
          ]
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Interrupteur du TD Borne IRVE
      { text: 'Interrupteur du TD Borne IRVE', style: 'sectionTitle' },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Paramètre', style: 'tableHeader' }, { text: 'Valeur', style: 'tableHeader' }],
            ['Intensité', `${data.interrupteurIntensiteVolts || ''} Volts`],
            ['lk3', data.interrupteurLk3 || ''],
            ['lk1', data.interrupteurLk1 || '']
          ]
        },
        margin: [0, 0, 0, 15]
      },
      
      // Interrupteur Photos
      {
        text: 'Photos de l\'interrupteur:',
        style: 'subheader',
        margin: [0, 10, 0, 5],
        pageBreak: 'before'
      },
      ...await (async () => {
        const content: Content[] = [];
        if (data.interrupteurPhotos && data.interrupteurPhotos.length > 0) {
          for (let i = 0; i < Math.min(data.interrupteurPhotos.length, 2); i++) {
            const photo = data.interrupteurPhotos[i];
            if (!photo) continue;
            
            let imageDataUrl: string;
            if (photo instanceof File) {
              const reader = new FileReader();
              imageDataUrl = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(photo);
              });
            } else {
              imageDataUrl = photo;
            }
            
            const stackItem: ContentStack = {
              stack: [
                {
                  image: imageDataUrl,
                  width: 150,
                  alignment: 'center'
                },
                {
                  text: `Photo ${i + 1} de l'interrupteur`,
                  alignment: 'center',
                  italics: true,
                  margin: [0, 5, 0, 20]
                }
              ],
              margin: [0, 10, 0, 20]
            };
            content.push(stackItem);
          }
        }
        return content;
      })(),
      
      // Cable
      { text: 'Cable', style: 'sectionTitle' },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Paramètre', style: 'tableHeader' }, { text: 'Valeur', style: 'tableHeader' }],
            ['Longueur', data.cableLongueur || ''],
            ['Section', data.cableSection || ''],
            ['Type', data.cableType || ''],
            ['Mode de pose', data.cableModePose || ''],
            ['Nb circuit adjacent', data.cableNbCircuitAdjacent || '']
          ]
        },
        margin: [0, 0, 0, 15]
      },
      
      // Cable Photos
      {
        text: 'Photos du cable:',
        style: 'subheader',
        margin: [0, 10, 0, 5]
      },
      ...await (async () => {
        const content: Content[] = [];
        if (data.cablePhotos && data.cablePhotos.length > 0) {
          for (let i = 0; i < Math.min(data.cablePhotos.length, 2); i++) {
            const photo = data.cablePhotos[i];
            if (!photo) continue;
            
            let imageDataUrl: string;
            if (photo instanceof File) {
              const reader = new FileReader();
              imageDataUrl = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(photo);
              });
            } else {
              imageDataUrl = photo;
            }
            
            const stackItem: ContentStack = {
              stack: [
                {
                  image: imageDataUrl,
                  width: 150,
                  alignment: 'center'
                },
                {
                  text: `Photo ${i + 1} du cable`,
                  alignment: 'center',
                  italics: true,
                  margin: [0, 5, 0, 20]
                }
              ],
              margin: [0, 10, 0, 20]
            };
            content.push(stackItem);
          }
        }
        return content;
      })(),
      
      // Borne
      { text: 'Borne', style: 'sectionTitle' },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [{ text: 'Paramètre', style: 'tableHeader' }, { text: 'Valeur', style: 'tableHeader' }],
            ['Puissance', data.bornePuissance ? `${data.bornePuissance}` : '']
          ]
        },
        margin: [0, 0, 0, 15]
      },
      
      // Borne Photos
      {
        text: 'Photos de la borne:',
        style: 'subheader',
        margin: [0, 10, 0, 5]
      },
      ...await (async () => {
        const content: Content[] = [];
        if (data.bornePhotos && data.bornePhotos.length > 0) {
          for (let i = 0; i < Math.min(data.bornePhotos.length, 2); i++) {
            const photo = data.bornePhotos[i];
            if (!photo) continue;
            
            let imageDataUrl: string;
            if (photo instanceof File) {
              const reader = new FileReader();
              imageDataUrl = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(photo);
              });
            } else {
              imageDataUrl = photo;
            }
            
            const stackItem: ContentStack = {
              stack: [
                {
                  image: imageDataUrl,
                  width: 150,
                  alignment: 'center'
                },
                {
                  text: `Photo ${i + 1} de la borne`,
                  alignment: 'center',
                  italics: true,
                  margin: [0, 5, 0, 20]
                }
              ],
              margin: [0, 10, 0, 20]
            };
            content.push(stackItem);
          }
        }
        return content;
      })(),
      
      // Remarques
      ...await getCommonContent(data),
      
      // Footer with date
      {
        text: `Date d'intervention: ${date.formatDate(new Date(), 'DD/MM/YYYY')}`,
        margin: [0, 30, 0, 0],
        alignment: 'right' as const
      }
    ]
  };

  return pdfMake.createPdf(documentDefinition);
};
