"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for personal use",
      features: ["Up to 40 minutes", "100 participants", "Basic recording", "Chat support"]
    },
    {
      name: "Pro",
      price: "$14.99",
      description: "Best for small teams",
      features: ["Unlimited meeting time", "300 participants", "Cloud recording", "Priority support"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$19.99",
      description: "For large organizations",
      features: ["Unlimited everything", "Advanced security", "Custom branding", "Dedicated support"]
    }
  ]

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mb-6">
            Simple, transparent{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`glass-card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 flex flex-col ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
              <CardHeader className="text-center">
                {plan.popular && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 w-fit mx-auto">
                    Most Popular
                  </div>
                )}
                <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-white mt-4">
                  {plan.price}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-300 mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}