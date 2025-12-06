import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  PageSpinner,
} from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { useSettings, useUpdateSettings } from '@/hooks/useApi'
import toast from 'react-hot-toast'

export function Settings() {
  const { data, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      supportEmail: '',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      freeTrialDays: 7,
      maxFreeQuestions: 5,
    },
  })

  const watchMaintenanceMode = watch('maintenanceMode')
  const watchRegistrationEnabled = watch('registrationEnabled')
  const watchEmailVerification = watch('emailVerificationRequired')

  useEffect(() => {
    if (data) {
      reset({
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
        contactEmail: data.contactEmail || '',
        supportEmail: data.supportEmail || '',
        maintenanceMode: data.maintenanceMode || false,
        registrationEnabled: data.registrationEnabled !== false,
        emailVerificationRequired: data.emailVerificationRequired !== false,
        freeTrialDays: data.freeTrialDays || 7,
        maxFreeQuestions: data.maxFreeQuestions || 5,
      })
    }
  }, [data, reset])

  const onSubmit = async (formData) => {
    try {
      await updateMutation.mutateAsync(formData)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to save settings')
    }
  }

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your platform settings"
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                {...register('siteName')}
                placeholder="StudySouq"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                {...register('siteDescription')}
                placeholder="Educational platform for students"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Email addresses for communication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                placeholder="contact@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                {...register('supportEmail')}
                placeholder="support@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Access Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>Manage user access and registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-neutral-500">
                  Temporarily disable access for all non-admin users
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={watchMaintenanceMode}
                onCheckedChange={(checked) => setValue('maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="registrationEnabled">Enable Registration</Label>
                <p className="text-sm text-neutral-500">
                  Allow new users to create accounts
                </p>
              </div>
              <Switch
                id="registrationEnabled"
                checked={watchRegistrationEnabled}
                onCheckedChange={(checked) => setValue('registrationEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailVerificationRequired">Require Email Verification</Label>
                <p className="text-sm text-neutral-500">
                  Users must verify their email before accessing content
                </p>
              </div>
              <Switch
                id="emailVerificationRequired"
                checked={watchEmailVerification}
                onCheckedChange={(checked) => setValue('emailVerificationRequired', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Free Tier Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Free Tier Limits</CardTitle>
            <CardDescription>Configure limits for free users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="freeTrialDays">Free Trial Days</Label>
                <Input
                  id="freeTrialDays"
                  type="number"
                  min="0"
                  {...register('freeTrialDays', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFreeQuestions">Max Free Questions/Day</Label>
                <Input
                  id="maxFreeQuestions"
                  type="number"
                  min="0"
                  {...register('maxFreeQuestions', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" loading={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
