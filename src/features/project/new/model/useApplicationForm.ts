import { arrayMove } from "@dnd-kit/sortable"
import { useMemo, useState } from "react"

import { makeQuestion } from "@/features/project/new/model/applicationQuestion"

import { useProjectRegisterStore } from "./useProjectRegisterStore"

import type {
  Question,
  Section,
} from "@/features/project/new/model/applicationQuestion"

function insertAfter<T extends { id: string }>(
  arr: T[],
  afterId: string,
  item: T,
): T[] {
  const idx = arr.findIndex((el) => el.id === afterId)
  const next = [...arr]
  next.splice(idx + 1, 0, item)
  return next
}

function updateById<T extends { id: string }>(
  arr: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return arr.map((el) => (el.id === id ? { ...el, ...patch } : el))
}

function removeById<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter((el) => el.id !== id)
}

const DEFAULT_SECTIONS: Section[] = [
  { id: "design", name: "Design", isEnabled: false, questions: [] },
  { id: "frontend", name: "Frontend", isEnabled: false, questions: [] },
  { id: "backend", name: "Backend", isEnabled: false, questions: [] },
]

export function useApplicationForm() {
  const storeApplication = useProjectRegisterStore((s) => s.application)
  const setApplication = useProjectRegisterStore((s) => s.setApplication)
  const [focusedId, setFocusedId] = useState<string | null>(null)

  const commonQuestions = useMemo<Question[]>(
    () =>
      storeApplication.commonQuestions.length > 0
        ? storeApplication.commonQuestions
        : [makeQuestion()],
    [storeApplication.commonQuestions],
  )

  const sections: Section[] =
    storeApplication.sections.length > 0
      ? storeApplication.sections
      : DEFAULT_SECTIONS

  function updateCommonQuestion(id: string, patch: Partial<Question>) {
    setApplication({ commonQuestions: updateById(commonQuestions, id, patch) })
  }

  function deleteCommonQuestion(id: string) {
    setApplication({ commonQuestions: removeById(commonQuestions, id) })
    setFocusedId((prev) => (prev === id ? null : prev))
  }

  function addCommonQuestion(afterId: string) {
    const newQ = makeQuestion()
    setApplication({
      commonQuestions: insertAfter(commonQuestions, afterId, newQ),
    })
  }

  function updateSection(sectionId: string, patch: Partial<Section>) {
    setApplication({ sections: updateById(sections, sectionId, patch) })
  }

  function updateSectionQuestion(
    sectionId: string,
    questionId: string,
    patch: Partial<Question>,
  ) {
    setApplication({
      sections: sections.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, questions: updateById(s.questions, questionId, patch) },
      ),
    })
  }

  function deleteSectionQuestion(sectionId: string, questionId: string) {
    setApplication({
      sections: sections.map((s) => {
        if (s.id !== sectionId) return s
        const questions = removeById(s.questions, questionId)
        return { ...s, questions, isEnabled: questions.length > 0 }
      }),
    })
    setFocusedId((prev) => (prev === questionId ? null : prev))
  }

  function addSectionQuestion(sectionId: string, afterId: string) {
    const newQ = makeQuestion()
    setApplication({
      sections: sections.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, questions: insertAfter(s.questions, afterId, newQ) },
      ),
    })
  }

  function appendSectionQuestion(sectionId: string) {
    const newQ = makeQuestion()
    setApplication({
      sections: sections.map((s) =>
        s.id !== sectionId ? s : { ...s, questions: [...s.questions, newQ] },
      ),
    })
    setFocusedId(newQ.id)
  }

  function reorderCommonQuestion(fromIndex: number, toIndex: number) {
    setApplication({
      commonQuestions: arrayMove(commonQuestions, fromIndex, toIndex),
    })
  }

  function reorderSectionQuestion(
    sectionId: string,
    fromIndex: number,
    toIndex: number,
  ) {
    setApplication({
      sections: sections.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, questions: arrayMove(s.questions, fromIndex, toIndex) },
      ),
    })
  }

  return {
    commonQuestions,
    sections,
    focusedId,
    setFocusedId,
    updateCommonQuestion,
    deleteCommonQuestion,
    addCommonQuestion,
    updateSection,
    updateSectionQuestion,
    deleteSectionQuestion,
    addSectionQuestion,
    appendSectionQuestion,
    reorderCommonQuestion,
    reorderSectionQuestion,
  }
}
