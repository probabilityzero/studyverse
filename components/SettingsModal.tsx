'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

interface SettingsModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [active, setActive] = React.useState<'general' | 'appearance' | 'shortcuts'>('appearance')

  React.useEffect(() => {
    if (theme) {
    }
  }, [theme])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] min-h-80">
          <aside className="border-r border-border p-4 bg-muted/20">
            <nav className="flex flex-col gap-1">
              <button
                className={`text-left px-3 py-2 rounded ${active === 'general' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                onClick={() => setActive('general')}
              >
                General
              </button>
              <button
                className={`text-left px-3 py-2 rounded ${active === 'appearance' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                onClick={() => setActive('appearance')}
              >
                Appearance
              </button>
              <button
                className={`text-left px-3 py-2 rounded ${active === 'shortcuts' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                onClick={() => setActive('shortcuts')}
              >
                Shortcuts
              </button>
            </nav>
          </aside>

          <main className="p-6">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>Adjust your preferences</DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              {active === 'appearance' && (
                <section className="space-y-4">
                  <h4 className="font-medium">Theme</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <RadioGroup
                        defaultValue={theme ?? 'system'}
                        value={theme ?? 'system'}
                        onValueChange={(v) => setTheme(v)}
                        className="grid gap-2"
                      >
                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="system" />
                          <Monitor className="size-4" />
                          <div>
                            <div className="font-medium">System</div>
                            <div className="text-sm text-muted-foreground">Follow OS preference</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="light" />
                          <Sun className="size-4" />
                          <div>
                            <div className="font-medium">Light</div>
                            <div className="text-sm text-muted-foreground">Light theme</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="dark" />
                          <Moon className="size-4" />
                          <div>
                            <div className="font-medium">Dark</div>
                            <div className="text-sm text-muted-foreground">Dark theme</div>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>

                    <div className="w-full sm:w-48 p-3 border rounded bg-background">
                      <div className="text-sm text-muted-foreground mb-2">Preview</div>
                      <div className="h-20 rounded flex items-center justify-center border border-border">Preview Area</div>
                    </div>
                  </div>
                </section>
              )}

              {active === 'general' && (
                <section>
                  <h4 className="font-medium">General</h4>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Autosave</div>
                        <div className="text-sm text-muted-foreground">Save files automatically</div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </section>
              )}

              {active === 'shortcuts' && (
                <section>
                  <h4 className="font-medium">Shortcuts</h4>
                  <div className="mt-3 text-sm text-muted-foreground">Customize keyboard shortcuts</div>
                </section>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => onOpenChange && onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => onOpenChange && onOpenChange(false)}>Save</Button>
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal
