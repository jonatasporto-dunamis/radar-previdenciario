"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { createLeadAction } from "@/app/cadastro/actions";
import { PrimaryButton } from "@/components/common/primary-button";
import { useTrackingConfig } from "@/components/tracking/TrackingProvider";
import { dispatchBrowserExternalEvent } from "@/lib/tracking";
import { getAttributionFromSession } from "@/lib/attribution";
import { leadFormSchema, type LeadFormInput } from "@/lib/validations/lead";
import { formatBrazilianPhone } from "@/utils/phone";

const genericFormError =
  "Não foi possível concluir seu cadastro agora. Revise os dados ou tente novamente.";

export function LeadRegistrationForm({
  officeName,
  nextPath = "/quiz",
}: {
  officeName: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const trackingConfig = useTrackingConfig();
  const [isPending, startTransition] = useTransition();
  const [isHydrated, setIsHydrated] = useState(false);
  const [leadStartedTracked, setLeadStartedTracked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      triageConsent: false,
      marketingConsent: false,
      website: "",
      attribution: {},
    },
    shouldFocusError: true,
  });

  const phoneValue = watch("phone");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  function onSubmit(values: LeadFormInput) {
    setFormError(null);

    startTransition(async () => {
      const result = await createLeadAction({
        ...values,
        attribution: getAttributionFromSession(),
      });

      if (result.success) {
        if (result.externalEventId) {
          dispatchBrowserExternalEvent({
            config: trackingConfig,
            eventName: "LeadSubmitted",
            eventId: result.externalEventId,
            leadId: result.leadId,
            metadata: {
              source: "lead_registration",
              form_version: "v1",
            },
            scope: result.leadId,
          });
        }

        router.push(nextPath);
        return;
      }

      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          const message = messages[0];

          if (message) {
            setError(field as keyof LeadFormInput, {
              type: "server",
              message,
            });
          }
        });
      }

      setFormError(result.formError ?? genericFormError);
    });
  }

  return (
    <form
      className="bg-card shadow-card mt-10 rounded-xl border p-6"
      method="post"
      noValidate
      onFocusCapture={() => {
        if (leadStartedTracked) {
          return;
        }

        setLeadStartedTracked(true);
        dispatchBrowserExternalEvent({
          config: trackingConfig,
          eventName: "LeadStarted",
          metadata: {
            source: "lead_form_interaction",
            form_version: "v1",
          },
          scope: "lead-form",
        });
      }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5">
        <div>
          <label
            className="text-foreground text-sm font-medium"
            htmlFor="fullName"
          >
            Nome completo
          </label>
          <input
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            aria-invalid={Boolean(errors.fullName)}
            autoComplete="name"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 h-12 w-full rounded-md border px-3 text-sm transition outline-none focus-visible:ring-2"
            id="fullName"
            placeholder="Informe seu nome e sobrenome"
            type="text"
            {...register("fullName")}
          />
          {errors.fullName?.message ? (
            <p className="text-danger mt-2 text-sm" id="fullName-error">
              {errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="email"
            >
              E-mail
            </label>
            <input
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 h-12 w-full rounded-md border px-3 text-sm transition outline-none focus-visible:ring-2"
              id="email"
              inputMode="email"
              placeholder="voce@email.com"
              type="email"
              {...register("email")}
            />
            {errors.email?.message ? (
              <p className="text-danger mt-2 text-sm" id="email-error">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="phone"
            >
              Telefone
            </label>
            <input
              aria-describedby={errors.phone ? "phone-error" : undefined}
              aria-invalid={Boolean(errors.phone)}
              autoComplete="tel"
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 h-12 w-full rounded-md border px-3 text-sm transition outline-none focus-visible:ring-2"
              id="phone"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              type="tel"
              value={phoneValue}
              {...register("phone", {
                onChange: (event) => {
                  setValue("phone", formatBrazilianPhone(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: Boolean(errors.phone),
                  });
                },
              })}
            />
            {errors.phone?.message ? (
              <p className="text-danger mt-2 text-sm" id="phone-error">
                {errors.phone.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="sr-only">
          <label htmlFor="website">Website</label>
          <input
            autoComplete="off"
            id="website"
            tabIndex={-1}
            type="text"
            {...register("website")}
          />
        </div>

        <div className="border-border bg-muted/45 grid gap-4 rounded-md border p-4">
          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              aria-describedby={
                errors.triageConsent ? "triageConsent-error" : undefined
              }
              aria-invalid={Boolean(errors.triageConsent)}
              className="border-input text-primary focus-visible:ring-ring mt-1 size-4 rounded outline-none focus-visible:ring-2"
              type="checkbox"
              {...register("triageConsent")}
            />
            <span className="text-muted-foreground">
              Li a{" "}
              <Link
                className="text-foreground underline underline-offset-4"
                href="/privacidade"
              >
                Política de Privacidade
              </Link>{" "}
              e autorizo o uso das informações fornecidas para realizar esta
              triagem e tratar desta solicitação. Consulte também os{" "}
              <Link
                className="text-foreground underline underline-offset-4"
                href="/termos"
              >
                Termos de Uso
              </Link>
              .
            </span>
          </label>
          {errors.triageConsent?.message ? (
            <p className="text-danger text-sm" id="triageConsent-error">
              {errors.triageConsent.message}
            </p>
          ) : null}

          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              className="border-input text-primary focus-visible:ring-ring mt-1 size-4 rounded outline-none focus-visible:ring-2"
              type="checkbox"
              {...register("marketingConsent")}
            />
            <span className="text-muted-foreground">
              Desejo receber conteúdos informativos e comunicações futuras da
              equipe responsável. Esta opção é facultativa e não impede a
              triagem.
              <span className="sr-only"> Escritório: {officeName}.</span>
            </span>
          </label>
        </div>

        {formError ? (
          <p className="text-danger text-sm" role="alert">
            {formError}
          </p>
        ) : null}

        <PrimaryButton
          className="w-full sm:w-fit"
          disabled={isPending || !isHydrated}
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Iniciar triagem informativa
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </PrimaryButton>
      </div>
    </form>
  );
}
