import { arrayMove } from "@dnd-kit/sortable"
import { useState } from "react"

import { makeQuestion } from "@/features/project/new/model/applicationQuestion"

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

interface UseApplicationFormOptions {
  initialCommonQuestions?: () => Question[]
  initialSections?: () => Section[]
}

export function useApplicationForm(options?: UseApplicationFormOptions) {
  const [commonQuestions, setCommonQuestions] = useState<Question[]>(
    options?.initialCommonQuestions ?? (() => [makeQuestion()]),
  )

  const [sections, setSections] = useState<Section[]>(
    options?.initialSections ??
      (() => [
        { id: "design", name: "Design", isEnabled: false, questions: [] },
        { id: "frontend", name: "Frontend", isEnabled: false, questions: [] },
        { id: "backend", name: "Backend", isEnabled: false, questions: [] },
      ]),
  )

  const [focusedId, setFocusedId] = useState<string | null>(null)

  function updateCommonQuestion(id: string, patch: Partial<Question>) {
    setCommonQuestions((prev) => updateById(prev, id, patch))
  }

  function deleteCommonQuestion(id: string) {
    setCommonQuestions((prev) => removeById(prev, id))
    setFocusedId((prev) => (prev === id ? null : prev))
  }

  function addCommonQuestion(afterId: string) {
    const newQ = makeQuestion()
    setCommonQuestions((prev) => insertAfter(prev, afterId, newQ))
    setFocusedId(newQ.id)
  }

  function updateSection(sectionId: string, patch: Partial<Section>) {
    setSections((prev) => updateById(prev, sectionId, patch))
  }

  function updateSectionQuestion(
    sectionId: string,
    questionId: string,
    patch: Partial<Question>,
  ) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, questions: updateById(s.questions, questionId, patch) },
      ),
    )
  }

  function deleteSectionQuestion(sectionId: string, questionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, questions: removeById(s.questions, questionId) },
      ),
    )
    setFocusedId((prev) => (prev === questionId ? null : prev))
  }

  function addSectionQuestion(sectionId: string, afterId: string) {
    const newQ = makeQuestion()
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, questions: insertAfter(s.questions, afterId, newQ) },
      ),
    )
    setFocusedId(newQ.id)
  }

  function appendSectionQuestion(sectionId: string) {
    const newQ = makeQuestion()
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId ? s : { ...s, questions: [...s.questions, newQ] },
      ),
    )
    setFocusedId(newQ.id)
  }

  function reorderCommonQuestion(fromIndex: number, toIndex: number) {
    setCommonQuestions((prev) => arrayMove(prev, fromIndex, toIndex))
  }

  function reorderSectionQuestion(
    sectionId: string,
    fromIndex: number,
    toIndex: number,
  ) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, questions: arrayMove(s.questions, fromIndex, toIndex) },
      ),
    )
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
