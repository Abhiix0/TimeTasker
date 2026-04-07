import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/feature-card'
import { Clock, CheckSquare, BarChart3, Zap, Focus, Smartphone } from 'lucide-react'

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-balance">
              <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Smart Time Tasker
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto">
              A distraction-free productivity system using the Pomodoro Technique. Stay focused, track progress, and achieve more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button asChild size="lg" className="rounded-full bg-linear-to-r from-primary to-accent hover:shadow-lg">
                <Link href="/timer">Start Timer</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to boost your productivity and stay focused on what matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Pomodoro Timer"
              description="Work sessions of 25 minutes with 5-minute breaks. Long breaks every 4 sessions to maximize focus and recovery."
            />
            <FeatureCard
              icon={<CheckSquare className="w-8 h-8" />}
              title="Task Manager"
              description="Create, organize, and track your tasks. Mark them complete as you progress through your day."
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Analytics Dashboard"
              description="Visualize your productivity with detailed statistics about focus time and completed tasks."
            />
            <FeatureCard
              icon={<Focus className="w-8 h-8" />}
              title="Distraction-Free"
              description="Built for deep work. Leave your phone distractions behind with our ESP32 hardware system."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Hardware Integration"
              description="Control your sessions with dedicated buttons, LCD display, and audio alerts on your device."
            />
            <FeatureCard
              icon={<Smartphone className="w-8 h-8" />}
              title="Web Companion"
              description="Sync sessions and track productivity from anywhere. Responsive design works on all devices."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to unlock your productive potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Set Your Task',
                description: 'Create a task or select one from your list to focus on during your session.'
              },
              {
                step: '02',
                title: 'Start a Session',
                description: 'Begin a 25-minute work session. Leave your phone behind and use our hardware device.'
              },
              {
                step: '03',
                title: 'Track Progress',
                description: 'Watch your productivity grow. Review statistics and completed tasks in your dashboard.'
              }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                
                {/* Arrow */}
                {parseInt(item.step) < 3 && (
                  <div className="hidden md:flex absolute top-8 -right-12 items-center justify-center">
                    <div className="w-8 h-0.5 bg-linear-to-r from-primary to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Device Preview Section */}
      <section className="py-20 md:py-28 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Hardware-Enhanced Productivity</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Our ESP32-based device puts you in control. A dedicated interface with buttons, an LCD display, and audio feedback keeps you focused without smartphone distractions.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Real-time timer display on LCD',
                  'Push buttons for session control',
                  'Audio alerts for session transitions',
                  'Independent operation without smartphone',
                  'Web dashboard synchronization'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" className="rounded-full bg-linear-to-r from-primary to-accent hover:shadow-lg">
                <Link href="/device">Learn About Device</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-full h-96 bg-linear-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center border border-primary/20">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-muted-foreground">ESP32 Device Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Productivity?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your first Pomodoro session today and experience the power of focused work.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full bg-linear-to-r from-primary to-accent hover:shadow-lg">
              <Link href="/timer">Get Started Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

