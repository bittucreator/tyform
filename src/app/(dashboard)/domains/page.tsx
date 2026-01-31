import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DomainsList } from '@/components/domains/domains-list'
import { AddDomainButton } from '@/components/domains/add-domain-button'
import type { Domain, Form } from '@/types/database'

export default async function DomainsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: domainsData } = await supabase
    .from('domains')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const domains = (domainsData || []) as Domain[]

  // Fetch user's forms for Pretty URLs
  const { data: formsData } = await supabase
    .from('forms')
    .select('id, title')
    .eq('user_id', user.id)
    .order('title', { ascending: true })

  const forms = (formsData || []) as Pick<Form, 'id' | 'title'>[]
  
  const totalDomains = domains.length
  const verifiedDomains = domains.filter(d => d.verified).length
  const pendingDomains = domains.filter(d => !d.verified).length

  return (
    <div className="space-y-5 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight">Domains</h1>
          <p className="text-[13px] text-muted-foreground/80 mt-0.5">
            Connect custom domains to your forms
          </p>
        </div>
        <AddDomainButton userId={user.id} />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 border border-border/50 rounded-lg bg-card overflow-hidden divide-x divide-border/50">
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Total</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{totalDomains}</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Verified</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{verifiedDomains}</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Pending</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{pendingDomains}</p>
        </div>
      </div>

      <DomainsList domains={domains} userId={user.id} forms={forms} />
    </div>
  )
}
