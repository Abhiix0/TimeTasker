import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Brain, Target, Zap, Users } from 'lucide-react'

export const metadata = {
  title: 'About Us - Smart Time Tasker',
  description: 'Learn about our mission to help people achieve more through focused work.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Smart Time Tasker</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Helping students and professionals achieve their goals through distraction-free productivity.
          </p>
        </div>

        {/* Problem Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">The Problem</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              In today's digital world, distractions are everywhere. Your smartphone buzzes with notifications. Social media beckons. Email inbox never stops growing.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Studies show that the average person is interrupted every 3-5 minutes. It takes 23 minutes to refocus after an interruption. This constant context switching decimates productivity and increases stress.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Students struggle to complete assignments. Professionals miss deadlines. Entrepreneurs lose track of their ambitious goals. Everyone suffers from a critical problem: the inability to focus deeply.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full h-96 bg-gradient-to-br from-destructive/20 to-accent/20 rounded-3xl flex items-center justify-center border border-destructive/20">
              <div className="text-center">
                <div className="text-8xl mb-4">📱</div>
                <p className="text-muted-foreground">Constant Distractions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Solution Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div className="order-2 lg:order-1 flex items-center justify-center">
            <div className="relative w-full h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center border border-primary/20">
              <div className="text-center">
                <div className="text-8xl mb-4">✨</div>
                <p className="text-muted-foreground">Deep Focus</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold mb-6">Our Solution</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Smart Time Tasker combines the proven Pomodoro Technique with dedicated hardware to eliminate distractions at the source.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Focused Work Sessions</h3>
                  <p className="text-sm text-muted-foreground">25-minute focused work sprints with strategic breaks to maximize productivity.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-white">
                    <Brain className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Eliminate Distractions</h3>
                  <p className="text-sm text-muted-foreground">Dedicated hardware lets you leave your phone behind during work sessions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-white">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">Monitor your productivity with detailed analytics and weekly insights.</p>
                </div>
              </div>
            </div>

            <p className="text-lg text-muted-foreground">
              The result? Users report 40% increase in productivity, reduced stress, and a renewed ability to tackle ambitious goals.
            </p>
          </div>
        </div>

        {/* Why It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Why It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: 'Brain Science',
                description: 'Built on Pomodoro research showing humans can focus for 25 minutes optimally.'
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: 'Clear Goals',
                description: 'Defined work sessions with clear start and end points enhance motivation.'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Proven Method',
                description: 'Used by students, professionals, and teams worldwide for decades.'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Hardware Focus',
                description: 'Dedicated device removes temptation and keeps you accountable.'
              }
            ].map((item, i) => (
              <Card key={i} className="p-6 border-border text-center">
                <div className="text-primary mb-4 flex justify-center">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Approach</h2>
          
          <div className="space-y-8 max-w-3xl mx-auto">
            {[
              {
                title: 'Identify Your Goal',
                description: 'Know what you want to accomplish. Break large goals into focused tasks.'
              },
              {
                title: 'Create Your Task List',
                description: 'Add tasks to your Smart Time Tasker dashboard. Prioritize what matters most.'
              },
              {
                title: 'Start a Session',
                description: 'Pick up your device. Leave your phone. Focus for 25 uninterrupted minutes.'
              },
              {
                title: 'Take Strategic Breaks',
                description: 'After each session, take 5-minute breaks. Every 4 sessions, take a longer 15-minute break.'
              },
              {
                title: 'Track & Celebrate',
                description: 'Watch your productivity grow. Review statistics. Celebrate completed tasks.'
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent text-white font-bold">
                    {i + 1}
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

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 border-border text-center">
            <p className="text-4xl font-bold text-primary mb-2">1M+</p>
            <p className="text-muted-foreground">Focus Sessions Completed</p>
          </Card>
          <Card className="p-8 border-border text-center">
            <p className="text-4xl font-bold text-accent mb-2">50K+</p>
            <p className="text-muted-foreground">Active Users Worldwide</p>
          </Card>
          <Card className="p-8 border-border text-center">
            <p className="text-4xl font-bold text-secondary mb-2">40%</p>
            <p className="text-muted-foreground">Avg Productivity Increase</p>
          </Card>
        </div>

        {/* Mission Statement */}
        <Card className="p-12 border-border bg-gradient-to-br from-primary/10 to-accent/10 text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            To empower every student, professional, and entrepreneur to achieve their most ambitious goals through focused work, strategic breaks, and distraction-free productivity.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe deep work is the superpower of the modern age. Smart Time Tasker is here to help you harness it.
          </p>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Focus Revolution</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start your journey to uninterrupted focus and unprecedented productivity today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-primary to-accent hover:shadow-lg">
              <Link href="/timer">Start Your First Session</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/device">Explore Our Device</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
