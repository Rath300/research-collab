import Link from "next/link";
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  BarChart2, 
  Zap, 
  Globe, 
  Search, 
  MessageSquare, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with glass effect */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container py-3">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl gradient-purple-blue flex items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <span className="text-2xl font-bold font-heading text-foreground">ResearchCollab</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="px-4 py-2 text-foreground hover:text-accent font-medium transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 rounded-xl gradient-bg text-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section with animated elements */}
      <section className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh z-[-1]"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[-1]">
          <div className="absolute -top-[40%] -left-[30%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[100px]"></div>
          <div className="absolute -bottom-[40%] -right-[30%] w-[80%] h-[80%] rounded-full bg-accent/10 blur-[100px]"></div>
        </div>
        
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left animate-slideInFromLeft">
              <div className="inline-flex items-center rounded-full border border-border bg-background/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                Academic research platforms reimagined
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading mb-6 tracking-tight">
                Elevate Your <span className="gradient-text">Academic Research</span> Collaborations
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0">
                Connect with researchers worldwide, collaborate on groundbreaking projects, and accelerate the pace of scientific discovery.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/signup" 
                  className="btn btn-primary px-8 py-3 text-base rounded-xl gradient-bg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Join the Community
                </Link>
                <Link 
                  href="/about" 
                  className="btn btn-outline px-8 py-3 text-base rounded-xl group flex items-center justify-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-muted-foreground text-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn(
                      "inline-block h-8 w-8 rounded-full border-2 border-background",
                      i === 1 && "bg-blue-400",
                      i === 2 && "bg-green-400",
                      i === 3 && "bg-amber-400",
                      i === 4 && "bg-rose-400",
                    )} />
                  ))}
                </div>
                <span>Join 10,000+ researchers worldwide</span>
              </div>
            </div>
            
            <div className="flex-1 relative animate-scaleUp">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative z-10 bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
                <div className="aspect-[4/3]">
                  <div className="w-full h-full bg-muted grid place-items-center p-6">
                    <div className="glass rounded-xl p-8 w-full max-w-md">
                      <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                          <h3 className="font-semibold tracking-tight text-xl">Research Matching</h3>
                          <p className="text-sm text-muted-foreground">Find perfect collaborators</p>
                        </div>
                        <div className="rounded-full bg-primary/10 p-3">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {["Machine Learning", "Climate Science", "Bioinformatics"].map((field, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="font-medium text-primary">{field.substring(0, 2)}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{field}</h4>
                              <div className="mt-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${(i + 1) * 25}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{(i + 1) * 25}%</span>
                          </div>
                        ))}
                        
                        <button className="w-full py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
                          View more research fields
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section with improved cards */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-border bg-background/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur mb-4">
              <span className="flex h-2 w-2 rounded-full bg-accent mr-2"></span>
              Designed for academic excellence
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 tracking-tight">Why Choose ResearchCollab?</h2>
            <p className="text-xl text-muted-foreground">
              Our platform is designed to solve the unique challenges of academic collaboration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-6 w-6 text-primary" />,
                title: "Find Ideal Collaborators",
                description: "Our matching algorithm connects you with researchers who complement your expertise and share your research interests.",
                color: "bg-primary/10",
                textColor: "text-primary"
              },
              {
                icon: <BookOpen className="h-6 w-6 text-accent" />,
                title: "Share Research Insights",
                description: "Publish your findings, get feedback from peers, and discover cutting-edge research in your field.",
                color: "bg-accent/10",
                textColor: "text-accent"
              },
              {
                icon: <BarChart2 className="h-6 w-6 text-blue-500" />,
                title: "Track Contributions",
                description: "Get recognized for your research contributions with our verification system and build your academic reputation.",
                color: "bg-blue-500/10",
                textColor: "text-blue-500"
              }
            ].map((feature, i) => (
              <div key={i} className="card card-hover group animate-fadeIn" style={{ animationDelay: `${i * 150}ms` }}>
                <div className={cn("rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4", feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold font-heading mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">
                  {feature.description}
                </p>
                <div className="mt-auto">
                  <Link href="#" className={cn("inline-flex items-center text-sm font-medium", feature.textColor)}>
                    Learn more <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 grid md:grid-cols-4 gap-8">
            {[
              { icon: <Zap />, label: "Lightning fast communication" },
              { icon: <Globe />, label: "Global research community" },
              { icon: <Search />, label: "Advanced research discovery" },
              { icon: <MessageSquare />, label: "Seamless real-time collaboration" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card/50 animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="rounded-full p-3 bg-primary/10 mb-4">
                  {item.icon}
                </div>
                <p className="font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA section with enhanced visuals */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.075] to-accent/[0.075] z-[-1]"></div>
        <div className="container relative">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-[50px]"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-[50px]"></div>
            
            <div className="relative glass p-8 md:p-12 rounded-2xl border border-border">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-sm text-accent backdrop-blur mb-6">
                  <Zap className="h-3.5 w-3.5 mr-2" />
                  Limited spots available
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 tracking-tight">Ready to advance your research?</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join thousands of researchers who are already collaborating on breakthrough projects.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/signup" 
                    className="btn btn-primary px-8 py-3 rounded-xl gradient-bg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Started Today
                  </Link>
                  <Link 
                    href="/demo" 
                    className="btn btn-outline px-8 py-3 text-base rounded-xl group flex items-center justify-center"
                  >
                    Book a Demo
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer with improved layout */}
      <footer className="border-t border-border bg-card/50">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-purple-blue flex items-center justify-center">
                  <span className="text-sm font-bold text-white">R</span>
                </div>
                <span className="text-xl font-bold font-heading text-foreground">ResearchCollab</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Connecting researchers worldwide to accelerate academic discovery and collaboration.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} ResearchCollab. All rights reserved.
            </p>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <div className="h-4 w-px bg-border"></div>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <div className="h-4 w-px bg-border"></div>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
