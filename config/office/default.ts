import type { OfficeConfig } from "@/types/brand";

export const defaultRetentionPolicy = {
  incompleteSessionDays: 30,
  completedTriageDays: 180,
  activeLeadDays: 365,
  trackingDays: 180,
  internalTrackingDays: 180,
  securityLogDays: 180,
  notificationLogDays: 180,
  externalDeliveryDays: 180,
  auditLogDays: 365,
} satisfies OfficeConfig["dataRetention"];

export const defaultOfficeConfig: OfficeConfig = {
  responsibleLawyer: "EDILSON DE ALMEIDA RESENDE",
  oab: "OAB/BA 45.987",
  legalProfessional: {
    name: "EDILSON DE ALMEIDA RESENDE",
    registration: "45.987",
    sectional: "BA",
    displayRegistration: "OAB/BA 45.987",
  },
  legalIdentity: {
    officeName: "Resende Advogados Associados",
    responsibleProfessionalName: "EDILSON DE ALMEIDA RESENDE",
    professionalRegistration: "OAB/BA 45.987",
  },
  specialties: [
    "Atuação em Direito Previdenciário",
    "Planejamento previdenciário",
    "Benefícios do INSS",
  ],
  citiesServed: ["Vitória da Conquista", "Belo Campo", "Jitaúna"],
  statesServed: ["BA"],
  serviceMode: "Atendimento presencial e remoto",
  workingHours: "Segunda a sexta, das 9h às 18h",
  whatsappDefaultMessage:
    "Olá, concluí a triagem informativa no Radar Previdenciário e gostaria de obter mais informações sobre os próximos passos.",
  units: ["Vitória da Conquista/BA", "Belo Campo/BA", "Jitaúna/BA"],
  privacy: {
    contactEmail: undefined,
    contactChannel: undefined,
  },
  dataRetention: defaultRetentionPolicy,
  email: {
    fromName: "Resende Advogados Associados",
    fromAddress: "contato@mail.radarprevidenciario.com.br",
    replyTo: "contato@resendeadvogados.com.br",
    notificationEmail: "",
  },
};
