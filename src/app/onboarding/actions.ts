'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function submitOnboarding(formData: FormData) {
    const supabase = await createClient()

    // Make sure user is actually signed in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const facilityName = formData.get('facilityName') as string

    // Call the robust postgres function to securely bypass standard user insertions 
    // since they do not yet have an assigned `facility_id`.
    const { error } = await supabase.rpc('onboard_facility', {
        facility_name: facilityName,
        user_first_name: firstName,
        user_last_name: lastName
    })

    if (error) {
        console.error("Error during onboarding:", error.message)
        redirect(`/onboarding?error=Unable+to+create+workspace.+${encodeURIComponent(error.message)}`)
    }

    redirect('/dashboard')
}
