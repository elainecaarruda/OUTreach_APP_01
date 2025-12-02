import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { Readable } from 'stream';

export async function generateTestimonyWord(testimonyData) {
  const {
    title = 'Testemunho',
    personalInfo = '',
    profileInfo = '',
    eventInfo = '',
    decisionInfo = '',
    summaryText = '',
    evangelismoTitle = '',
    evangelismoDate = ''
  } = testimonyData;

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
          thematicBreak: false,
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Informações do Evangelismo',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: `Evento: ${evangelismoTitle}`,
        }),
        new Paragraph({
          text: `Data: ${evangelismoDate}`,
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Informações Pessoais',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: personalInfo || 'Não preenchido',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Perfil',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: profileInfo || 'Não preenchido',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Experiência no Evento',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: eventInfo || 'Não preenchido',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Decisão',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: decisionInfo || 'Não preenchido',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Resumo',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: summaryText || 'Não preenchido',
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}

export function bufferToStream(buffer) {
  return Readable.from(buffer);
}
