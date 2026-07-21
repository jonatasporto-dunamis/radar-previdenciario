"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  GripVertical,
  ListChecks,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  saveQuizBuilderDraftAction,
  updateQuizTemplateStatusAction,
} from "@/app/painel/quizzes/actions";
import { quizBuilderQuestionTypes } from "@/lib/validations/quiz-builder";
import type { QuizBuilderDraftInput } from "@/lib/validations/quiz-builder";
import type { OfficeQuizTemplateDetail } from "@/types/office-dashboard";

type BuilderQuestion = QuizBuilderDraftInput["questions"][number];

const steps = [
  "Informações",
  "Perguntas",
  "Lógica",
  "Resultado",
  "Aparência",
  "Preview",
  "Publicação",
] as const;

const questionTypeLabels: Record<
  (typeof quizBuilderQuestionTypes)[number],
  string
> = {
  boolean: "Sim/Não",
  checkbox: "Múltipla escolha",
  date: "Data",
  info: "Informação/aviso",
  number: "Número",
  phone: "Telefone",
  radio: "Escolha única",
  select: "Seleção",
  text: "Texto curto",
  textarea: "Texto longo",
};

const optionQuestionTypes = new Set(["radio", "checkbox", "select"]);

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function normalizeOptionValue(value: string) {
  return slugify(value).replace(/-/g, "_").slice(0, 80);
}

function readStringMetadata(
  metadata: Record<string, unknown>,
  key: string,
  fallback = "",
) {
  const value = metadata[key];

  return typeof value === "string" ? value : fallback;
}

function readAppearance(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const value = metadata.appearance;

  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function createQuestion(seed: number): BuilderQuestion {
  return {
    questionKey: `pergunta-${seed}`,
    title: "Nova pergunta",
    description: null,
    type: "radio",
    required: true,
    sensitive: false,
    allowsUnknown: true,
    allowsWithheld: true,
    active: true,
    options: [
      { label: "Sim", value: "sim" },
      { label: "Não", value: "nao" },
      { label: "Não sei informar", value: "unknown" },
    ],
    conditions: {},
    metadata: {},
  };
}

function mapTemplateQuestions(
  template: OfficeQuizTemplateDetail,
): BuilderQuestion[] {
  if (!template.questions.length) {
    return [createQuestion(1)];
  }

  return template.questions.map((question) => {
    const type = quizBuilderQuestionTypes.includes(
      question.type as (typeof quizBuilderQuestionTypes)[number],
    )
      ? (question.type as BuilderQuestion["type"])
      : "radio";
    const options =
      optionQuestionTypes.has(type) && question.options.length < 2
        ? [
            ...question.options,
            { label: "Não sei informar", value: "unknown" },
            { label: "Não se aplica", value: "not_applicable" },
          ].filter(
            (option, index, items) =>
              items.findIndex((item) => item.value === option.value) === index,
          )
        : question.options;

    return {
      id: question.id,
      questionKey: question.questionKey,
      title: question.title,
      description: question.description,
      type,
      required: question.required,
      sensitive: question.sensitive,
      allowsUnknown: question.allowsUnknown,
      allowsWithheld: question.allowsWithheld,
      active: question.active,
      options,
      conditions: question.conditions,
      metadata: question.metadata,
    };
  });
}

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);

  if (!item) {
    return items;
  }

  next.splice(to, 0, item);
  return next;
}

export function VisualQuizBuilder({
  template,
  canEdit,
}: {
  template: OfficeQuizTemplateDetail;
  canEdit: boolean;
}) {
  const appearance = readAppearance(template.metadata);
  const [activeStep, setActiveStep] =
    useState<(typeof steps)[number]>("Informações");
  const [name, setName] = useState(template.name);
  const [slug, setSlug] = useState(template.slug);
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(template.description);
  const [templateType, setTemplateType] = useState<string>(template.type);
  const [theme, setTheme] = useState(
    readStringMetadata(template.metadata, "theme", "default"),
  );
  const [channel, setChannel] = useState(
    readStringMetadata(template.metadata, "channel"),
  );
  const [campaign, setCampaign] = useState(
    readStringMetadata(template.metadata, "campaign"),
  );
  const [introMessage, setIntroMessage] = useState(
    readStringMetadata(template.metadata, "introMessage"),
  );
  const [disclaimer, setDisclaimer] = useState(
    readStringMetadata(template.metadata, "disclaimer"),
  );
  const [resultTitle, setResultTitle] = useState(
    readStringMetadata(template.metadata, "resultTitle"),
  );
  const [resultSummary, setResultSummary] = useState(
    readStringMetadata(template.metadata, "resultSummary"),
  );
  const [resultNextStep, setResultNextStep] = useState(
    readStringMetadata(template.metadata, "resultNextStep"),
  );
  const [primaryColor, setPrimaryColor] = useState(
    typeof appearance.primaryColor === "string"
      ? appearance.primaryColor
      : "#123c69",
  );
  const [secondaryColor, setSecondaryColor] = useState(
    typeof appearance.secondaryColor === "string"
      ? appearance.secondaryColor
      : "#e2b714",
  );
  const [buttonText, setButtonText] = useState(
    typeof appearance.buttonText === "string"
      ? appearance.buttonText
      : "Continuar",
  );
  const [layoutDensity, setLayoutDensity] = useState<"standard" | "compact">(
    appearance.layoutDensity === "compact" ? "compact" : "standard",
  );
  const [questions, setQuestions] = useState(() =>
    mapTemplateQuestions(template),
  );
  const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState("Pronto para editar.");
  const [isPending, startTransition] = useTransition();
  const didMountRef = useRef(false);

  const draft = useMemo<QuizBuilderDraftInput>(
    () => ({
      templateId: template.id,
      name,
      slug,
      description,
      templateType,
      theme,
      channel: channel || null,
      campaign: campaign || null,
      introMessage: introMessage || null,
      disclaimer: disclaimer || null,
      resultTitle: resultTitle || null,
      resultSummary: resultSummary || null,
      resultNextStep: resultNextStep || null,
      primaryColor,
      secondaryColor,
      buttonText,
      layoutDensity,
      questions,
    }),
    [
      buttonText,
      campaign,
      channel,
      description,
      disclaimer,
      introMessage,
      layoutDensity,
      name,
      primaryColor,
      questions,
      resultNextStep,
      resultSummary,
      resultTitle,
      secondaryColor,
      slug,
      template.id,
      templateType,
      theme,
    ],
  );
  const serializedDraft = JSON.stringify(draft);

  useEffect(() => {
    if (!canEdit) {
      return;
    }

    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("Salvando alterações...");
    const timeout = window.setTimeout(() => {
      void saveQuizBuilderDraftAction(draft).then((result) => {
        setSaveStatus(result.success ? "saved" : "error");
        setSaveMessage(result.message);
      });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [canEdit, draft, serializedDraft]);

  function updateQuestion(index: number, patch: Partial<BuilderQuestion>) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    );
  }

  function addOption(index: number) {
    const question = questions[index];
    const draftValue = optionDrafts[question.questionKey]?.trim();

    if (!question || !draftValue) {
      return;
    }

    const value = normalizeOptionValue(draftValue);

    if (!value || question.options.some((option) => option.value === value)) {
      return;
    }

    updateQuestion(index, {
      options: [...question.options, { label: draftValue, value }],
    });
    setOptionDrafts((current) => ({ ...current, [question.questionKey]: "" }));
  }

  function addQuestion() {
    setQuestions((current) => [...current, createQuestion(current.length + 1)]);
    setActiveStep("Perguntas");
  }

  function duplicateQuestion(index: number) {
    const question = questions[index];

    if (!question) {
      return;
    }

    setQuestions((current) => [
      ...current.slice(0, index + 1),
      {
        ...question,
        id: undefined,
        questionKey: `${question.questionKey}-copia-${Date.now()}`,
        title: `${question.title} (cópia)`,
      },
      ...current.slice(index + 1),
    ]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) {
      return;
    }

    if (!window.confirm("Remover esta pergunta do draft?")) {
      return;
    }

    setQuestions((current) =>
      current.filter((_, questionIndex) => questionIndex !== index),
    );
  }

  function saveNow() {
    if (!canEdit) {
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("Salvando alterações...");
    startTransition(() => {
      void saveQuizBuilderDraftAction(draft).then((result) => {
        setSaveStatus(result.success ? "saved" : "error");
        setSaveMessage(result.message);
      });
    });
  }

  const checklist = [
    { label: "Nome e slug preenchidos", done: Boolean(name && slug) },
    { label: "Descrição preenchida", done: description.length >= 10 },
    { label: "Pelo menos uma pergunta", done: questions.length > 0 },
    {
      label: "Perguntas de escolha com duas opções",
      done: questions.every(
        (question) =>
          !optionQuestionTypes.has(question.type) ||
          question.options.length >= 2,
      ),
    },
    {
      label: "Texto público de resultado",
      done: Boolean(resultTitle || resultSummary),
    },
    { label: "Disclaimer informativo", done: Boolean(disclaimer) },
  ];
  const canPublish =
    template.canPublish && checklist.every((item) => item.done);
  const firstQuestion = questions[0];

  return (
    <div className="space-y-5">
      <div className="bg-card sticky top-0 z-20 flex flex-col gap-3 rounded-lg border p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Editor visual de quiz</p>
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-muted-foreground text-sm">{saveMessage}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              saveStatus === "error"
                ? "text-danger text-sm font-medium"
                : "text-muted-foreground text-sm"
            }
          >
            {saveStatus === "saving" || isPending
              ? "Salvando"
              : saveStatus === "saved"
                ? "Salvo"
                : saveStatus === "error"
                  ? "Erro ao salvar"
                  : "Sem alterações pendentes"}
          </span>
          {canEdit ? (
            <button
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold"
              onClick={saveNow}
              type="button"
            >
              <Save aria-hidden="true" className="size-4" />
              Salvar agora
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[16rem_minmax(0,1fr)_24rem]">
        <aside className="bg-card rounded-lg border p-3 xl:sticky xl:top-28 xl:self-start">
          <label className="text-muted-foreground text-xs font-semibold uppercase xl:hidden">
            Etapa
            <select
              className="bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
              onChange={(event) =>
                setActiveStep(event.target.value as (typeof steps)[number])
              }
              value={activeStep}
            >
              {steps.map((step) => (
                <option key={step} value={step}>
                  {step}
                </option>
              ))}
            </select>
          </label>
          <nav
            aria-label="Etapas do editor"
            className="hidden space-y-1 xl:block"
          >
            {steps.map((step) => (
              <button
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium ${
                  activeStep === step
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
                key={step}
                onClick={() => setActiveStep(step)}
                type="button"
              >
                {step}
              </button>
            ))}
          </nav>
        </aside>

        <section className="bg-card rounded-lg border p-5">
          {activeStep === "Informações" ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Informações do quiz</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Dados usados para organizar o draft, campanha e experiência
                  inicial.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Nome
                  <input
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    maxLength={160}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (!slugTouched) setSlug(slugify(event.target.value));
                    }}
                    value={name}
                  />
                  <span className="text-muted-foreground block text-xs">
                    {name.length}/160
                  </span>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Slug
                  <input
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    maxLength={120}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(slugify(event.target.value));
                    }}
                    value={slug}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium md:col-span-2">
                  Descrição
                  <textarea
                    className="bg-background min-h-28 w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    maxLength={800}
                    onChange={(event) => setDescription(event.target.value)}
                    value={description}
                  />
                  <span className="text-muted-foreground block text-xs">
                    {description.length}/800
                  </span>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Tema
                  <input
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setTheme(event.target.value)}
                    value={theme}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Tipo
                  <input
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setTemplateType(event.target.value)}
                    value={templateType}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Canal
                  <input
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setChannel(event.target.value)}
                    value={channel}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Campanha
                  <input
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setCampaign(event.target.value)}
                    value={campaign}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium md:col-span-2">
                  Mensagem introdutória
                  <textarea
                    className="bg-background min-h-24 w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setIntroMessage(event.target.value)}
                    value={introMessage}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium md:col-span-2">
                  Disclaimer
                  <textarea
                    className="bg-background min-h-24 w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setDisclaimer(event.target.value)}
                    value={disclaimer}
                  />
                </label>
              </div>
            </div>
          ) : null}

          {activeStep === "Perguntas" ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Perguntas</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Arraste os cards ou use as setas para reordenar.
                  </p>
                </div>
                {canEdit ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold"
                    onClick={addQuestion}
                    type="button"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Adicionar pergunta
                  </button>
                ) : null}
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <article
                    className="rounded-lg border p-4"
                    draggable={canEdit}
                    key={`${question.id ?? question.questionKey}-${index}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={() => setDraggedIndex(index)}
                    onDrop={() => {
                      if (draggedIndex === null || draggedIndex === index)
                        return;
                      setQuestions((current) =>
                        moveItem(current, draggedIndex, index),
                      );
                      setDraggedIndex(null);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <GripVertical
                          aria-hidden="true"
                          className="text-muted-foreground size-4"
                        />
                        <p className="font-semibold">Pergunta {index + 1}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          aria-label="Mover pergunta para cima"
                          className="rounded-md border p-2"
                          disabled={!canEdit || index === 0}
                          onClick={() =>
                            setQuestions((current) =>
                              moveItem(current, index, index - 1),
                            )
                          }
                          type="button"
                        >
                          <ArrowUp aria-hidden="true" className="size-4" />
                        </button>
                        <button
                          aria-label="Mover pergunta para baixo"
                          className="rounded-md border p-2"
                          disabled={!canEdit || index === questions.length - 1}
                          onClick={() =>
                            setQuestions((current) =>
                              moveItem(current, index, index + 1),
                            )
                          }
                          type="button"
                        >
                          <ArrowDown aria-hidden="true" className="size-4" />
                        </button>
                        <button
                          aria-label="Duplicar pergunta"
                          className="rounded-md border p-2"
                          disabled={!canEdit}
                          onClick={() => duplicateQuestion(index)}
                          type="button"
                        >
                          <Copy aria-hidden="true" className="size-4" />
                        </button>
                        <button
                          aria-label="Excluir pergunta"
                          className="rounded-md border p-2"
                          disabled={!canEdit || questions.length <= 1}
                          onClick={() => removeQuestion(index)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm font-medium md:col-span-2">
                        Título
                        <input
                          className="bg-background w-full rounded-md border px-3 py-2"
                          disabled={!canEdit}
                          onChange={(event) =>
                            updateQuestion(index, { title: event.target.value })
                          }
                          value={question.title}
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium">
                        Chave segura
                        <input
                          className="bg-background w-full rounded-md border px-3 py-2"
                          disabled={!canEdit}
                          onChange={(event) =>
                            updateQuestion(index, {
                              questionKey: slugify(event.target.value),
                            })
                          }
                          value={question.questionKey}
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium">
                        Tipo
                        <select
                          className="bg-background w-full rounded-md border px-3 py-2"
                          disabled={!canEdit}
                          onChange={(event) =>
                            updateQuestion(index, {
                              type: event.target
                                .value as BuilderQuestion["type"],
                            })
                          }
                          value={question.type}
                        >
                          {quizBuilderQuestionTypes.map((type) => (
                            <option key={type} value={type}>
                              {questionTypeLabels[type]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm font-medium md:col-span-2">
                        Descrição
                        <textarea
                          className="bg-background min-h-20 w-full rounded-md border px-3 py-2"
                          disabled={!canEdit}
                          onChange={(event) =>
                            updateQuestion(index, {
                              description: event.target.value || null,
                            })
                          }
                          value={question.description ?? ""}
                        />
                      </label>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      {[
                        ["required", "Obrigatória"],
                        ["sensitive", "Sensível"],
                        ["allowsUnknown", "Permite não sei"],
                        ["allowsWithheld", "Permite não informar"],
                      ].map(([key, label]) => (
                        <label
                          className="flex items-center gap-2 rounded-md border p-3 text-sm"
                          key={key}
                        >
                          <input
                            checked={Boolean(
                              question[key as keyof BuilderQuestion],
                            )}
                            disabled={!canEdit}
                            onChange={(event) =>
                              updateQuestion(index, {
                                [key]: event.target.checked,
                              } as Partial<BuilderQuestion>)
                            }
                            type="checkbox"
                          />
                          {label}
                        </label>
                      ))}
                    </div>

                    {optionQuestionTypes.has(question.type) ? (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-semibold">Opções</p>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              className="grid gap-2 md:grid-cols-[1fr_12rem_auto]"
                              key={`${option.value}-${optionIndex}`}
                            >
                              <input
                                aria-label={`Rótulo da opção ${optionIndex + 1}`}
                                className="bg-background rounded-md border px-3 py-2 text-sm"
                                disabled={!canEdit}
                                onChange={(event) => {
                                  const options = [...question.options];
                                  options[optionIndex] = {
                                    ...option,
                                    label: event.target.value,
                                  };
                                  updateQuestion(index, { options });
                                }}
                                value={option.label}
                              />
                              <input
                                aria-label={`Valor da opção ${optionIndex + 1}`}
                                className="bg-background rounded-md border px-3 py-2 text-sm"
                                disabled={!canEdit}
                                onChange={(event) => {
                                  const options = [...question.options];
                                  options[optionIndex] = {
                                    ...option,
                                    value: normalizeOptionValue(
                                      event.target.value,
                                    ),
                                  };
                                  updateQuestion(index, { options });
                                }}
                                value={option.value}
                              />
                              <button
                                aria-label="Excluir opção"
                                className="rounded-md border p-2"
                                disabled={
                                  !canEdit || question.options.length <= 2
                                }
                                onClick={() =>
                                  updateQuestion(index, {
                                    options: question.options.filter(
                                      (_, currentIndex) =>
                                        currentIndex !== optionIndex,
                                    ),
                                  })
                                }
                                type="button"
                              >
                                <Trash2 aria-hidden="true" className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <input
                          aria-label={`Adicionar opção para ${question.title}`}
                          className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                          disabled={!canEdit}
                          onChange={(event) =>
                            setOptionDrafts((current) => ({
                              ...current,
                              [question.questionKey]: event.target.value,
                            }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addOption(index);
                            }
                          }}
                          placeholder="Digite uma opção e pressione Enter"
                          value={optionDrafts[question.questionKey] ?? ""}
                        />
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {activeStep === "Lógica" ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Lógica condicional</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Defina condições visuais sem expor JSON ao usuário.
                </p>
              </div>
              <div className="space-y-3">
                {questions.map((question, index) => {
                  const visibleWhen =
                    question.conditions.visibleWhen &&
                    typeof question.conditions.visibleWhen === "object" &&
                    !Array.isArray(question.conditions.visibleWhen)
                      ? (question.conditions.visibleWhen as Record<
                          string,
                          string
                        >)
                      : {};

                  return (
                    <div
                      className="rounded-lg border p-4"
                      key={question.questionKey}
                    >
                      <p className="font-medium">{question.title}</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <label className="space-y-2 text-sm font-medium">
                          SE pergunta
                          <select
                            className="bg-background w-full rounded-md border px-3 py-2"
                            disabled={!canEdit || index === 0}
                            onChange={(event) =>
                              updateQuestion(index, {
                                conditions: {
                                  ...question.conditions,
                                  visibleWhen: {
                                    ...visibleWhen,
                                    questionKey: event.target.value,
                                  },
                                },
                              })
                            }
                            value={visibleWhen.questionKey ?? ""}
                          >
                            <option value="">Sempre mostrar</option>
                            {questions
                              .slice(0, index)
                              .map((previousQuestion) => (
                                <option
                                  key={previousQuestion.questionKey}
                                  value={previousQuestion.questionKey}
                                >
                                  {previousQuestion.title}
                                </option>
                              ))}
                          </select>
                        </label>
                        <label className="space-y-2 text-sm font-medium">
                          Operador
                          <select
                            className="bg-background w-full rounded-md border px-3 py-2"
                            disabled={!canEdit || index === 0}
                            onChange={(event) =>
                              updateQuestion(index, {
                                conditions: {
                                  ...question.conditions,
                                  visibleWhen: {
                                    ...visibleWhen,
                                    operator: event.target.value,
                                  },
                                },
                              })
                            }
                            value={visibleWhen.operator ?? "equals"}
                          >
                            <option value="equals">igual</option>
                            <option value="not_equals">diferente</option>
                            <option value="contains">contém</option>
                            <option value="answered">respondido</option>
                            <option value="empty">vazio</option>
                          </select>
                        </label>
                        <label className="space-y-2 text-sm font-medium">
                          Valor
                          <input
                            className="bg-background w-full rounded-md border px-3 py-2"
                            disabled={!canEdit || index === 0}
                            onChange={(event) =>
                              updateQuestion(index, {
                                conditions: {
                                  ...question.conditions,
                                  visibleWhen: {
                                    ...visibleWhen,
                                    value: event.target.value,
                                  },
                                },
                              })
                            }
                            value={visibleWhen.value ?? ""}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeStep === "Resultado" ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Resultado público</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Textos informativos exibidos no preview e usados como base de
                  rascunho.
                </p>
              </div>
              <div className="grid gap-4">
                <label className="space-y-2 text-sm font-medium">
                  Título público
                  <input
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setResultTitle(event.target.value)}
                    value={resultTitle}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Resumo
                  <textarea
                    className="bg-background min-h-28 w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setResultSummary(event.target.value)}
                    value={resultSummary}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Próximo passo
                  <input
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setResultNextStep(event.target.value)}
                    value={resultNextStep}
                  />
                </label>
              </div>
              {template.moderation.level === "warning" ? (
                <p className="bg-warning/10 text-warning rounded-md p-3 text-sm">
                  Há termos que merecem revisão editorial antes de publicar.
                </p>
              ) : null}
            </div>
          ) : null}

          {activeStep === "Aparência" ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Aparência</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Ajustes controlados por tenant/template, sem CSS arbitrário.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Cor principal
                  <input
                    className="bg-background h-11 w-full rounded-md border px-2"
                    disabled={!canEdit}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    type="color"
                    value={primaryColor}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Cor secundária
                  <input
                    className="bg-background h-11 w-full rounded-md border px-2"
                    disabled={!canEdit}
                    onChange={(event) => setSecondaryColor(event.target.value)}
                    type="color"
                    value={secondaryColor}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Texto do botão
                  <input
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) => setButtonText(event.target.value)}
                    value={buttonText}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Layout
                  <select
                    className="bg-background w-full rounded-md border px-3 py-2"
                    disabled={!canEdit}
                    onChange={(event) =>
                      setLayoutDensity(
                        event.target.value === "compact"
                          ? "compact"
                          : "standard",
                      )
                    }
                    value={layoutDensity}
                  >
                    <option value="standard">Padrão</option>
                    <option value="compact">Compacto</option>
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          {activeStep === "Preview" ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Preview interativo</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Preview isolado. Não cria lead, sessão, tracking ou resposta
                  real.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {["Desktop", "Mobile"].map((mode) => (
                  <div className="rounded-lg border p-4" key={mode}>
                    <div className="mb-3 flex items-center gap-2">
                      <Eye aria-hidden="true" className="size-4" />
                      <p className="font-semibold">{mode}</p>
                    </div>
                    <div
                      className={`mx-auto rounded-lg border p-4 ${
                        mode === "Mobile" ? "max-w-72" : "max-w-xl"
                      }`}
                      style={{ borderColor: primaryColor }}
                    >
                      <p className="text-muted-foreground text-sm">
                        {introMessage || description}
                      </p>
                      <h4 className="mt-4 font-semibold">
                        {firstQuestion?.title ?? "Pergunta"}
                      </h4>
                      <div className="mt-3 space-y-2">
                        {(firstQuestion?.options.length
                          ? firstQuestion.options
                          : [{ label: "Resposta de exemplo", value: "example" }]
                        ).map((option) => (
                          <button
                            className="w-full rounded-md border px-3 py-2 text-left text-sm"
                            key={option.value}
                            style={{ borderColor: secondaryColor }}
                            type="button"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <button
                        className="mt-4 rounded-md px-4 py-2 text-sm font-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
                        type="button"
                      >
                        {buttonText}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeStep === "Publicação" ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">
                  Checklist de publicação
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Publicar cria o estado ativo do template tenant. Revise o
                  preview antes de ativar.
                </p>
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    className="flex items-center gap-3 rounded-md border p-3 text-sm"
                    key={item.label}
                  >
                    <ListChecks
                      aria-hidden="true"
                      className={
                        item.done
                          ? "text-success size-4"
                          : "text-warning size-4"
                      }
                    />
                    <span>{item.label}</span>
                    <span className="ml-auto font-semibold">
                      {item.done ? "OK" : "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
              {template.source === "tenant" ? (
                <form action={updateQuizTemplateStatusAction}>
                  <input name="templateId" type="hidden" value={template.id} />
                  <input name="status" type="hidden" value="active" />
                  <button
                    className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!canPublish}
                    type="submit"
                  >
                    Publicar quiz
                  </button>
                </form>
              ) : (
                <p className="text-muted-foreground rounded-md border p-3 text-sm">
                  Templates da plataforma devem ser clonados antes da publicação
                  por tenant.
                </p>
              )}
            </div>
          ) : null}
        </section>

        <aside className="bg-card rounded-lg border p-5 xl:sticky xl:top-28 xl:self-start">
          <h3 className="font-semibold">Resumo do draft</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Perguntas</dt>
              <dd className="font-medium">{questions.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{template.status}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Versão</dt>
              <dd className="font-medium">v{template.version}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Origem</dt>
              <dd className="font-medium">{template.source}</dd>
            </div>
          </dl>
          <p className="text-muted-foreground mt-4 text-sm">
            Alterações são salvas como rascunho com debounce. Se houver conflito
            ou moderação bloqueada, o indicador exibirá erro.
          </p>
        </aside>
      </div>
    </div>
  );
}
