import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InvalidCredentialsError } from '@/features/auth/auth-api'
import { loginSchema, type LoginValues } from '@/features/auth/login-schema'
import { useAuth } from '@/features/auth/use-auth'
import { toErrorMessage } from '@/lib/api'

interface LocationState {
  from?: { pathname?: string }
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
    mode: 'onSubmit',
  })

  // Send the user back to whatever they tried to open before the guard fired.
  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/'

  const onSubmit = async (values: LoginValues) => {
    setFormError(null)
    try {
      const user = await login(
        { email: values.email, password: values.password },
        values.remember,
      )
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message =
        error instanceof InvalidCredentialsError
          ? error.message
          : toErrorMessage(error, 'Could not sign you in.')
      setFormError(message)
      // Keep the email, clear the password — standard failed-login behaviour.
      form.resetField('password')
      form.setFocus('password')
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingBag className="size-4.5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">SARE</span>
            <span className="text-[10px] text-muted-foreground">
              powered by SHOFCO
            </span>
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">
                Sign in to your account
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your credentials to access the admin panel.
              </p>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@sare.africa"
                          autoFocus
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      {/* The wrapper sits outside FormControl: FormControl is a
                          Slot that forwards the generated id to its immediate
                          child, so the Input must be that child or the label
                          ends up pointing at the wrapper div instead. */}
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Keep me signed in
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="mt-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 rounded-lg border bg-muted/50 p-3 text-xs">
              <p className="font-semibold">Demo credentials</p>
              <p className="mt-1 text-muted-foreground">
                admin@sare.africa · Admin123!
              </p>
              <p className="text-muted-foreground">
                manager@sare.africa · Manager123!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-end">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-white/5"
        />
        <div className="relative max-w-md">
          <p className="text-5xl font-bold tracking-tight">35k</p>
          <p className="mt-4 text-lg leading-relaxed text-primary-foreground/85">
            Over 35,000 orders fulfilled, 35,000+ smiles delivered — thank you
            for an amazing journey since June 2024.
          </p>
          <p className="mt-6 text-sm text-primary-foreground/70">
            Manage shops, products and stock across the SARE network.
          </p>
        </div>
      </div>
    </div>
  )
}
