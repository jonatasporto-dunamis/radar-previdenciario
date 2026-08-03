"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { saveBrandingAction } from "@/app/painel/configuracoes/identidade/actions";
import type { TenantBrandingSettings } from "@/types/branding";

type Props = {
  displayName: string;
  legalName: string;
  settings: TenantBrandingSettings;
};
const colors = [
  ["primaryColor", "Cor principal"],
  ["secondaryColor", "Cor secundária"],
  ["accentColor", "Cor de destaque"],
  ["backgroundColor", "Fundo"],
  ["textColor", "Texto"],
  ["buttonColor", "Botão"],
  ["buttonTextColor", "Texto do botão"],
  ["whatsappColor", "WhatsApp"],
] as const;

export function BrandingSettingsForm({
  displayName: initialName,
  legalName,
  settings,
}: Props) {
  const [displayName, setDisplayName] = useState(initialName);
  const [draft, setDraft] = useState(settings);
  const [mobile, setMobile] = useState(false);
  const update = (key: keyof TenantBrandingSettings, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <form action={saveBrandingAction} className="space-y-8">
      <input name="version" type="hidden" value="1" />
      <section className="bg-background rounded-lg border p-5">
        <h3 className="font-semibold">Identidade e contato</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Nome exibido"
            name="displayName"
            value={displayName}
            onChange={setDisplayName}
            required
          />
          <Field
            label="Razão social"
            name="legalName"
            value={legalName}
            required
          />
          <Field
            label="WhatsApp (país + DDD)"
            name="whatsappNumber"
            value={draft.whatsappNumber}
            onChange={(v) => update("whatsappNumber", v)}
          />
          <Field
            label="Telefone de contato"
            name="contactPhone"
            value={draft.contactPhone}
            onChange={(v) => update("contactPhone", v)}
          />
          <Field
            label="Responsável profissional"
            name="responsibleProfessionalName"
            value={draft.responsibleProfessionalName}
            onChange={(v) => update("responsibleProfessionalName", v)}
          />
          <Field
            label="Registro profissional / OAB"
            name="professionalRegistration"
            value={draft.professionalRegistration}
            onChange={(v) => update("professionalRegistration", v)}
          />
          <Field
            label="E-mail de contato"
            name="contactEmail"
            type="email"
            value={draft.contactEmail}
            onChange={(v) => update("contactEmail", v)}
          />
          <Field
            label="Texto curto de contato"
            name="shortContactText"
            value={draft.shortContactText}
            onChange={(v) => update("shortContactText", v)}
          />
        </div>
      </section>

      <section className="bg-background rounded-lg border p-5">
        <h3 className="font-semibold">Cores acessíveis</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Ao publicar, texto/fundo e botão precisam atingir contraste WCAG AA.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colors.map(([name, label]) => (
            <label className="text-sm font-medium" key={name}>
              {label}
              <span className="mt-2 flex gap-2">
                <input
                  aria-label={`${label}: seletor`}
                  className="h-11 w-12 rounded border p-1"
                  type="color"
                  value={draft[name]}
                  onChange={(e) => update(name, e.target.value)}
                />
                <input
                  className="h-11 min-w-0 flex-1 rounded-md border px-3 font-mono"
                  name={name}
                  pattern="#[0-9a-fA-F]{6}"
                  value={draft[name]}
                  onChange={(e) => update(name, e.target.value)}
                  required
                />
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="bg-background rounded-lg border p-5">
        <h3 className="font-semibold">Conteúdo do cadastro</h3>
        <div className="mt-4 grid gap-4">
          <Field
            label="Título"
            name="registrationTitle"
            value={draft.registrationTitle}
            onChange={(v) => update("registrationTitle", v)}
            required
          />
          <TextArea
            label="Subtítulo"
            name="registrationSubtitle"
            value={draft.registrationSubtitle}
            onChange={(v) => update("registrationSubtitle", v)}
          />
          <TextArea
            label="Texto de apoio"
            name="registrationSupportText"
            value={draft.registrationSupportText}
            onChange={(v) => update("registrationSupportText", v)}
          />
          <Field
            label="Texto do botão"
            name="registrationButtonLabel"
            value={draft.registrationButtonLabel}
            onChange={(v) => update("registrationButtonLabel", v)}
            required
          />
          <Field
            label="Placeholder de nome"
            name="registrationNamePlaceholder"
            value={draft.registrationNamePlaceholder}
            onChange={(v) => update("registrationNamePlaceholder", v)}
            required
          />
          <Field
            label="Placeholder de e-mail"
            name="registrationEmailPlaceholder"
            value={draft.registrationEmailPlaceholder}
            onChange={(v) => update("registrationEmailPlaceholder", v)}
            required
          />
          <Field
            label="Placeholder de telefone"
            name="registrationPhonePlaceholder"
            value={draft.registrationPhonePlaceholder}
            onChange={(v) => update("registrationPhonePlaceholder", v)}
            required
          />
          <TextArea
            label="Mensagem institucional"
            name="institutionalMessage"
            value={draft.institutionalMessage}
            onChange={(v) => update("institutionalMessage", v)}
          />
          <TextArea
            label="Mensagem inicial do WhatsApp"
            name="whatsappMessage"
            value={draft.whatsappMessage}
            onChange={(v) => update("whatsappMessage", v)}
          />
        </div>
      </section>

      <section className="bg-background rounded-lg border p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Preview do cadastro</h3>
            <p className="text-muted-foreground text-sm">
              A prévia não publica alterações.
            </p>
          </div>
          <div className="flex rounded-md border p-1">
            <button
              aria-label="Preview desktop"
              className={`rounded p-2 ${!mobile ? "bg-muted" : ""}`}
              onClick={() => setMobile(false)}
              type="button"
            >
              <Monitor className="size-4" />
            </button>
            <button
              aria-label="Preview mobile"
              className={`rounded p-2 ${mobile ? "bg-muted" : ""}`}
              onClick={() => setMobile(true)}
              type="button"
            >
              <Smartphone className="size-4" />
            </button>
          </div>
        </div>
        <div
          className={`mx-auto mt-5 overflow-hidden rounded-lg border transition-all ${mobile ? "max-w-[390px]" : "max-w-3xl"}`}
          style={{
            backgroundColor: draft.backgroundColor,
            color: draft.textColor,
          }}
        >
          <div
            className="border-b p-4 font-semibold"
            style={{ color: draft.primaryColor }}
          >
            {displayName}
          </div>
          <div className="mx-auto max-w-lg p-6 text-center">
            <h4 className="text-2xl font-bold">{draft.registrationTitle}</h4>
            <p className="mt-3 text-sm">{draft.registrationSubtitle}</p>
            <div className="mt-5 space-y-3 rounded-lg border p-4 text-left">
              <div className="h-11 rounded border" />
              <div className="h-11 rounded border" />
              <button
                className="min-h-12 w-full rounded px-4 font-semibold"
                style={{
                  backgroundColor: draft.buttonColor,
                  color: draft.buttonTextColor,
                }}
                type="button"
              >
                {draft.registrationButtonLabel}
              </button>
            </div>
          </div>
        </div>
      </section>

      <button
        className="min-h-12 rounded-md bg-neutral-900 px-5 font-semibold text-white dark:bg-white dark:text-neutral-950"
        type="submit"
      >
        Salvar e publicar identidade
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        className="bg-background mt-2 h-12 w-full rounded-md border px-3"
        defaultValue={onChange ? undefined : value}
        name={name}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required={required}
        type={type}
        value={onChange ? value : undefined}
      />
    </label>
  );
}
function TextArea({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <textarea
        className="bg-background mt-2 min-h-24 w-full rounded-md border p-3"
        name={name}
        onChange={(e) => onChange(e.target.value)}
        value={value}
      />
    </label>
  );
}
