import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Cpu, Smartphone, Zap, Radio, Grid2X2 } from 'lucide-react'

export const metadata = {
  title: 'Device Guide - Smart Time Tasker',
  description: 'Learn about our ESP32-based Pomodoro device for distraction-free productivity.',
}

export default function DevicePage() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Time Tasker Device</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A hardware-based Pomodoro timer designed to eliminate smartphone distractions and maximize focus.
          </p>
        </div>

        {/* Device Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold mb-6">Device Overview</h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              The Smart Time Tasker device is built on the ESP32 microcontroller platform, a powerful and affordable solution that brings the Pomodoro Technique to life.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Leave your smartphone behind during focus sessions and use our dedicated device for complete distraction-free work. The device syncs with our web dashboard to track your productivity.
            </p>
            <ul className="space-y-3">
              {[
                'Independent operation without WiFi',
                'Real-time timer display with LCD screen',
                'Tactile button controls for session management',
                'Audio alerts for session transitions',
                'Compact and portable design',
                'USB charging for extended battery life'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-full h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center border border-primary/20">
              <div className="text-center">
                <div className="text-8xl mb-4">⏱️</div>
                <p className="text-muted-foreground">ESP32 Pomodoro Device</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Components */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Hardware Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Cpu className="w-8 h-8" />,
                title: 'ESP32 Microcontroller',
                description: 'Dual-core processor with WiFi and Bluetooth capabilities for fast and reliable performance.'
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: '16x2 LCD Display',
                description: 'Clear digital display shows remaining time, session mode, and status information at a glance.'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Push Buttons',
                description: 'Physical buttons for starting, pausing, and resetting sessions. Tactile feedback ensures responsive control.'
              },
              {
                icon: <Radio className="w-8 h-8" />,
                title: 'Buzzer Module',
                description: 'Audio alerts signal session transitions and breaks. Customizable tones for different events.'
              },
              {
                icon: <Grid2X2 className="w-8 h-8" />,
                title: 'Breadboard Layout',
                description: 'Modular design allows for easy modifications and extensions. Perfect for DIY customization.'
              },
              {
                icon: <Cpu className="w-8 h-8" />,
                title: 'Power Management',
                description: 'Efficient power consumption with USB-C charging. Long battery life for all-day productivity.'
              }
            ].map((component, i) => (
              <Card key={i} className="p-6 border-border hover:shadow-lg transition-shadow">
                <div className="text-primary mb-4">{component.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{component.title}</h3>
                <p className="text-sm text-muted-foreground">{component.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* How Device Works */}
        <div className="mb-16 bg-card/50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-12 text-center">How the Device Works</h2>
          
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Power On',
                description: 'Press the power button to activate the device. The LCD displays the current mode and welcome message.'
              },
              {
                step: '2',
                title: 'Select Mode',
                description: 'Use navigation buttons to select Work, Short Break, or Long Break mode. Default mode is Work session.'
              },
              {
                step: '3',
                title: 'Start Session',
                description: 'Press Start to begin your Pomodoro session. The timer counts down with real-time display updates.'
              },
              {
                step: '4',
                title: 'Session Complete',
                description: 'When time expires, the buzzer alerts you. The device automatically switches to break mode.'
              },
              {
                step: '5',
                title: 'Sync to Dashboard',
                description: 'Connect to WiFi periodically to sync your session data with the web dashboard for long-term tracking.'
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent">
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Settings */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Customization Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-border">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Adjustable Durations
              </h3>
              <p className="text-muted-foreground mb-4">
                Customize your session durations directly from the device menu:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>Work Session: 15-60 minutes (default 25)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent">•</span>
                  <span>Short Break: 1-15 minutes (default 5)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary">•</span>
                  <span>Long Break: 5-30 minutes (default 15)</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-border">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔊</span>
                Audio Settings
              </h3>
              <p className="text-muted-foreground mb-4">
                Control the sound experience for your sessions:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>Mute/Enable buzzer alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent">•</span>
                  <span>Adjust volume levels (low, medium, high)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary">•</span>
                  <span>Select alert tone (beep, chime, bell)</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Getting Started */}
        <Card className="p-12 border-border bg-gradient-to-br from-primary/10 to-accent/10 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Your Device?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            The Smart Time Tasker device comes with full setup instructions and troubleshooting guides. Start your distraction-free productivity journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-primary to-accent hover:shadow-lg">
              <Link href="/timer">Start with Web Timer</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/about">Learn About Us</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
