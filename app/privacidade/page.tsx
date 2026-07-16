import type { Metadata } from "next";
import { ContactCard } from "@/components/common/contact-card";
import { ContentContainer } from "@/components/common/content-container";
import { PageContainer } from "@/components/common/page-container";
import { SectionTitle } from "@/components/common/section-title";
import { getAppConfig } from "@/services/configuration";

export async function generateMetadata(): Promise<Metadata> {
  const { brand, legal } = await getAppConfig();

  return {
    title: legal.privacyPolicyTitle,
    description: `Informações iniciais de privacidade de ${brand.name}.`,
    alternates: {
      canonical: "/privacidade",
    },
  };
}

export default async function PrivacidadePage() {
  const { brand, legal, office } = await getAppConfig();
  const professionalDisplay = office.legalProfessional
    ? `${office.legalProfessional.name} — ${office.legalProfessional.displayRegistration}`
    : null;
  const privacyContact =
    office.privacy.contactEmail ??
    office.privacy.contactChannel ??
    brand.email ??
    null;
  const privacyContactHref =
    privacyContact && privacyContact.includes("@")
      ? `mailto:${privacyContact}`
      : null;

  return (
    <PageContainer>
      <section className="py-section">
        <ContentContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            <article className="bg-card shadow-card rounded-xl border p-8">
              <SectionTitle
                description={`Documento base para ${legal.privacyPolicyCompany}. A política deve acompanhar os dados tratados e as configurações vigentes do tenant.`}
                eyebrow={brand.poweredBy}
                title={legal.privacyPolicyTitle}
              />

              <div className="text-muted-foreground mt-8 grid gap-6 leading-7">
                <p>
                  Esta página resume como a triagem previdenciária informativa
                  trata dados pessoais. O controlador configurado é{" "}
                  {brand.legalName}
                  {professionalDisplay
                    ? `. Responsável profissional informado: ${professionalDisplay}`
                    : ""}
                  . Campos institucionais opcionais são exibidos apenas quando
                  estiverem configurados.
                </p>
                <p>
                  Canal de privacidade:{" "}
                  {privacyContactHref ? (
                    <a
                      className="text-foreground underline"
                      href={privacyContactHref}
                    >
                      {privacyContact}
                    </a>
                  ) : privacyContact ? (
                    <span className="text-foreground">{privacyContact}</span>
                  ) : (
                    <span className="text-foreground">
                      pendente de confirmação pelo escritório responsável
                    </span>
                  )}
                  .
                </p>
                <p>
                  Atendimento configurado: {office.serviceMode}, com unidades em{" "}
                  {office.units.join(", ")}. Horário: {office.workingHours}.
                </p>
                <p>
                  Dados tratados podem incluir identificação, contato,
                  atribuição de campanha, dados técnicos de acesso, respostas do
                  questionário, renda aproximada e informação limitada sobre
                  existência de condição de saúde que impacte o trabalho. O
                  sistema não solicita documentos, laudos ou diagnósticos
                  detalhados nesta etapa.
                </p>
                <p>
                  As finalidades são: permitir cadastro e retomada da sessão,
                  registrar consentimentos e eventos internos, gerar triagem
                  informativa, encaminhar contato ao escritório responsável,
                  prevenir abuso e manter auditoria operacional.
                </p>
                <p>
                  As bases legais preliminares estão organizadas por finalidade:
                  procedimentos solicitados pelo titular para cadastro e contato
                  relacionado à triagem; consentimento específico para dados
                  pessoais sensíveis; consentimento separado para marketing
                  futuro; consentimento para mensuração não essencial; e
                  hipóteses como segurança, prevenção de fraude, obrigação legal
                  ou exercício regular de direitos somente quando adequadas e
                  aprovadas após análise humana.
                </p>
                <p>
                  Para o MVP, o tratamento deve ser interpretado de forma
                  restritiva, com coleta mínima e sem exposição pública de
                  respostas, indicador interno ou classificação operacional. A
                  política de retenção inicial é configurável por tenant e está
                  documentada em procedimento próprio.
                </p>
                <p>{legal.cookiePolicy}</p>
                <p>
                  Quando habilitado, o sistema pode usar cookies e tecnologias
                  de mensuração para entender páginas visitadas, origem de
                  campanhas e etapas genéricas do funil. Isso pode envolver Meta
                  Pixel, Meta Conversions API, Google Analytics 4 e Google Tag
                  Manager.
                </p>
                <p>
                  A mensuração externa depende de consentimento quando essa
                  exigência estiver ativa. A preferência pode ser recusada ou
                  alterada posteriormente no próprio site, sem impedir o
                  cadastro, o quiz ou a visualização do resultado informativo.
                </p>
                <p>
                  Respostas do quiz, documentos, dados de saúde, classificação,
                  indicador interno, tema de análise, nome, e-mail e telefone em
                  texto puro não são enviados para Meta, Google Analytics ou GTM
                  para finalidade publicitária.
                </p>
                <p>
                  Podem atuar como operadores ou provedores técnicos serviços de
                  hospedagem e deploy, banco de dados, mensuração consentida e
                  envio de e-mails transacionais, incluindo Vercel, Supabase,
                  Resend e, quando ativados, Meta e Google. Esses fornecedores
                  devem ser avaliados quanto a segurança, confidencialidade e
                  eventual transferência internacional de dados.
                </p>
                <p>
                  O titular pode solicitar confirmação de tratamento, acesso,
                  correção, eliminação, informação sobre compartilhamento,
                  portabilidade quando aplicável e revisão de decisões
                  automatizadas, pelos canais indicados nesta página.
                </p>
                <p>
                  A revogação de consentimento, pedidos de acesso, correção,
                  bloqueio, anonimização ou exclusão devem seguir procedimento
                  documentado, com confirmação proporcional de identidade e
                  avaliação de impedimentos legais ou exercício regular de
                  direitos.
                </p>
                <p>{legal.disclaimer}</p>
              </div>
            </article>

            <ContactCard />
          </div>
        </ContentContainer>
      </section>
    </PageContainer>
  );
}
