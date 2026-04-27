import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ResultsClient from './ResultsClient'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [inspectionRes, responsesRes] = await Promise.all([
    supabase.from('inspections').select('*').eq('id', id).single(),
    supabase
      .from('inspection_responses')
      .select('*')
      .eq('inspection_id', id)
      .order('question_id', { ascending: true }),
  ])

  if (inspectionRes.error || !inspectionRes.data) {
    notFound()
  }

  return (
    <ResultsClient
      inspection={inspectionRes.data}
      responses={responsesRes.data ?? []}
    />
  )
}
