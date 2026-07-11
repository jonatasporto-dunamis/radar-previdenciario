import type { OfficeConfig } from "@/types/brand";

export const defaultOfficeConfig: OfficeConfig = {
  responsibleLawyer: "Advogado responsável a configurar",
  oab: "OAB/UF 000000",
  specialties: [
    "Direito Previdenciário",
    "Planejamento previdenciário",
    "Benefícios do INSS",
  ],
  citiesServed: ["Cidade a configurar", "Região metropolitana"],
  statesServed: ["UF"],
  serviceMode: "Atendimento presencial e remoto",
  workingHours: "Segunda a sexta, das 9h às 18h",
  whatsappDefaultMessage:
    "Olá, gostaria de iniciar uma análise previdenciária informativa.",
};
