import type { LegalConfig } from "@/types/brand";

const fullDisclaimer =
  "O Radar Previdenciário organiza informações para uma triagem inicial. O resultado não confirma direito a benefício, não constitui parecer jurídico e pode depender de documentos e avaliação individual.";

export const defaultLegalConfig: LegalConfig = {
  privacyPolicyTitle: "Política de Privacidade",
  privacyPolicyCompany: "Resende Advogados Associados",
  termsTitle: "Termos de Uso",
  disclaimer: fullDisclaimer,
  disclaimers: {
    full: fullDisclaimer,
    short: fullDisclaimer,
    emailInternal:
      "Classificação e indicador são critérios internos de priorização; não representam parecer jurídico, chance de êxito, promessa de resultado ou decisão de órgão competente.",
    registration:
      "O cadastro inicia uma triagem informativa e não constitui contratação do escritório.",
    result:
      "O resultado é informativo, não confirma direito a benefício e depende de análise individual com documentos por profissional habilitado.",
  },
  cookiePolicy:
    "Este ambiente utiliza cookies necessários para funcionamento e poderá utilizar cookies analíticos ou de mensuração somente quando habilitados e conforme as preferências registradas pelo usuário.",
};
