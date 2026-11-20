import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getMySyllabus, putMySyllabus, type SyllabusFields } from './api'
import { useAuth } from './auth'
import { semLabel } from './format'
import {
  EMPTY_SYLLABUS, LS_OTHER_REGS, LS_SYLLABUS, SyllabusContext, isComplete, isEmptySyllabus, pickSyllabus, readJSON,
  readLocalSyllabus, useCatalogue, writeJSON, type SyllabusCtx, type SyllabusLabels,
} from './state'

/**
 * "My syllabus": the student's default filter (university, regulation, branch, year and semester).
 * Signed in, it lives in the profile (GET/PUT /api/me/syllabus); for visitors, in this browser (lws.syllabus).
 * On the first sign-in with an empty profile, the visitor's choice is copied into the profile.
 */
export function SyllabusProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const qc = useQueryClient()
  const [local, setLocal] = useState<SyllabusFields>(readLocalSyllabus)
  const [showOtherRegs, setOther] = useState<boolean>(() => readJSON(LS_OTHER_REGS) === true)
  const catalogue = useCatalogue()

  const profile = useQuery({
    queryKey: ['syllabus', user?.id],
    queryFn: getMySyllabus,
    enabled: !!user,
    retry: false,
  })

  const copied = useRef<string | null>(null)
  useEffect(() => {
    if (!user || !profile.data || copied.current === user.id) return
    copied.current = user.id
    if (isEmptySyllabus(profile.data) && isComplete(local)) {
      putMySyllabus(pickSyllabus(local))
        .then((saved) => qc.setQueryData(['syllabus', user.id], saved))
        .catch(() => {
          /* the visitor choice is not valid any more; the Home card asks again */
        })
    }
  }, [user, profile.data, local, qc])

  const syllabus = useMemo(() => (user ? pickSyllabus(profile.data ?? EMPTY_SYLLABUS) : local), [user, profile.data, local])

  const save = useCallback(
    async (s: SyllabusFields) => {
      const clean = pickSyllabus(s)
      if (user) {
        const saved = await putMySyllabus(clean)
        qc.setQueryData(['syllabus', user.id], saved)
      } else {
        writeJSON(LS_SYLLABUS, clean)
        setLocal(clean)
      }
    },
    [user, qc],
  )

  const setShowOtherRegs = useCallback((v: boolean) => {
    writeJSON(LS_OTHER_REGS, v)
    setOther(v)
  }, [])

  const labels = useMemo<SyllabusLabels>(() => {
    const uni = catalogue.data?.universities.find((u) => u.slug === syllabus.university) ?? null
    return {
      university: uni,
      universityShort: uni?.short_name ?? syllabus.university?.toUpperCase() ?? null,
      regulation: syllabus.regulation,
      branchShort: uni?.branches.find((b) => b.slug === syllabus.branch)?.short_name ?? null,
      semester: syllabus.year && syllabus.semester ? semLabel(syllabus.year, syllabus.semester) : null,
    }
  }, [catalogue.data, syllabus])

  const value: SyllabusCtx = {
    syllabus,
    ready: !loading && (!user || !profile.isLoading),
    complete: isComplete(syllabus),
    labels,
    save,
    showOtherRegs,
    setShowOtherRegs,
  }
  return <SyllabusContext.Provider value={value}>{children}</SyllabusContext.Provider>
}
