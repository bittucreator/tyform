import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MembersList } from '@/components/members/members-list'

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-7xl mx-auto p-6">
      <MembersList />
    </div>
  )
}
