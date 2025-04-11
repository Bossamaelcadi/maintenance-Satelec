import type { TDocumentDefinitions } from 'pdfmake/interfaces';

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
  photo?: File | null;
  remarques?: string;
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

interface BorneRechargeData extends MaintenanceData {
  lieuIntervention?: string;
  typeBorne?: string;
  numeroBorne?: number;
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

  if (data.photo) {
    const reader = new FileReader();
    const imageDataUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(data.photo as File);
    });

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

  return content;
};

export const generatePDF = async (data: MaintenanceData, type: 'transformateur' | 'poste-htbt' | 'tgbt' | 'borne-recharge') => {
  switch (type) {
    case 'transformateur':
      return generateTransformateurPDF(data);
    case 'poste-htbt':
      return generatePosteHTBTPDF(data);
    case 'tgbt':
      return generateTGBTPDF(data);
    case 'borne-recharge':
      return generateBorneRechargePDF(data);
    default:
      throw new Error('Type de document non supporté');
  }
};

const savePDFHistory = (data: MaintenanceData, type: 'transformateur' | 'poste-htbt' | 'tgbt' | 'borne-recharge') => {
  const historyItem = {
    date: new Date().toISOString(),
    type,
    formData: data
  };

  const history = localStorage.getItem('pdfHistory');
  const pdfHistory = history ? JSON.parse(history) : [];
  pdfHistory.push(historyItem);
  localStorage.setItem('pdfHistory', JSON.stringify(pdfHistory));
};

export const generateTransformateurPDF = async (data: TransformateurData): Promise<TCreatedPdf> => {
  savePDFHistory(data, 'transformateur');
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: 'Rapport de maintenance - Transformateur', style: 'header' },
      { text: `Date: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
      { text: 'Informations générales :', style: 'subheader' },
      {
        ul: [
          `Client : ${data.client || 'Non spécifié'}`,
          `Site : ${data.site || 'Non spécifié'}`,
          `Nom du transformateur : ${data.nomTransformateur || 'Non spécifié'}`,
          `Puissance : ${data.puissance || 'Non spécifiée'}`
        ]
      },
      { text: 'Contrôles effectués :', style: 'subheader', margin: [0, 20, 0, 10] },
      getControlesTable(data.controles),
      ...(await getCommonContent(data))
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 20]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 13
      }
    },
    defaultStyle: {
      fontSize: 12
    }
  };

  const pdfMakeInstance = await initPdfMake();
  return pdfMakeInstance.createPdf(docDefinition);
};

export const generatePosteHTBTPDF = async (data: PosteHTBTData): Promise<TCreatedPdf> => {
  savePDFHistory(data, 'poste-htbt');
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: 'Rapport de maintenance - Poste HT/BT', style: 'header' },
      { text: `Date: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
      { text: 'Informations générales :', style: 'subheader' },
      {
        ul: [
          `Client : ${data.client || 'Non spécifié'}`,
          `Site : ${data.site || 'Non spécifié'}`,
          `Nom du poste : ${data.nomPoste || 'Non spécifié'}`,
          `Nombre de cellules : ${data.nombreCellules || 'Non spécifié'}`,
          `Type de cellule : ${data.typeCellule || 'Non spécifié'}`
        ]
      },
      { text: 'Contrôles effectués :', style: 'subheader', margin: [0, 20, 0, 10] },
      getControlesTable(data.controles),
      ...(await getCommonContent(data))
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 20]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 13
      }
    },
    defaultStyle: {
      fontSize: 12
    }
  };

  const pdfMakeInstance = await initPdfMake();
  return pdfMakeInstance.createPdf(docDefinition);
};

export const generateTGBTPDF = async (data: TGBTData): Promise<TCreatedPdf> => {
  savePDFHistory(data, 'tgbt');
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: 'Rapport de maintenance - TGBT', style: 'header' },
      { text: `Date: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
      { text: 'Informations générales :', style: 'subheader' },
      {
        ul: [
          `Client : ${data.client || 'Non spécifié'}`,
          `Site : ${data.site || 'Non spécifié'}`,
          `Nom du TGBT : ${data.nomTGBT || 'Non spécifié'}`
        ]
      },
      { text: 'Contrôles effectués :', style: 'subheader', margin: [0, 20, 0, 10] },
      getControlesTable(data.controles),
      ...(await getCommonContent(data))
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 20]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 13
      }
    },
    defaultStyle: {
      fontSize: 12
    }
  };

  const pdfMakeInstance = await initPdfMake();
  return pdfMakeInstance.createPdf(docDefinition);
};

export const generateBorneRechargePDF = async (data: BorneRechargeData): Promise<TCreatedPdf> => {
  savePDFHistory(data, 'borne-recharge');
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: 'Rapport de maintenance - Borne de recharge', style: 'header' },
      { text: `Date: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
      { text: 'Informations générales :', style: 'subheader' },
      {
        ul: [
          `Lieu d'intervention : ${data.lieuIntervention || 'Non spécifié'}`,
          `Type de borne : ${data.typeBorne || 'Non spécifié'}`,
          `Numéro de la borne : ${data.numeroBorne || 'Non spécifié'}`
        ]
      },
      { text: 'Contrôles effectués :', style: 'subheader', margin: [0, 20, 0, 10] },
      getControlesTable(data.controles),
      ...(await getCommonContent(data))
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 20]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 13
      }
    },
    defaultStyle: {
      fontSize: 12
    }
  };

  const pdfMakeInstance = await initPdfMake();
  return pdfMakeInstance.createPdf(docDefinition);
};
