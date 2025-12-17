import { Link } from "react-router-dom";
import { Layout } from "@/frontend/components/layout/Layout";
import { Button } from "@/frontend/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/frontend/components/ui/breadcrumb";

const About = () => {
  return (
    <Layout>
      <div className="pt-24 md:pt-28">
        <div className="container-narrow section-padding">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>About</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
              About HOME2STUDENTS
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              We're on a mission to make student accommodation simple, comfortable,
              and community-focused. Founded in 2020, HOME2STUDENTS has grown to become
              Portugal's leading student housing provider.
            </p>
          </div>

          {/* Content */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Students collaborating"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-heading font-semibold text-foreground">
                Our Story
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                HOME2STUDENTS was born from a simple observation: finding quality student
                accommodation in Portugal was unnecessarily complicated. As former
                international students ourselves, we experienced firsthand the
                challenges of securing safe, affordable, and well-located housing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we operate premium residences in Lisbon, Porto, Coimbra, and
                Braga, serving thousands of students from over 50 countries. Our
                spaces are designed to foster community, support academic success,
                and create unforgettable memories.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mt-20">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-8 text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Community First",
                  description:
                    "We believe the best student experiences happen when people come together. Our spaces are designed to foster connections.",
                },
                {
                  title: "Quality Living",
                  description:
                    "From furniture to WiFi speed, every detail is considered. We maintain high standards so you can focus on what matters.",
                },
                {
                  title: "Transparent Service",
                  description:
                    "No hidden fees, no surprises. We believe in clear communication and straightforward pricing.",
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="p-6 bg-muted rounded-xl text-center"
                >
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-heading font-semibold text-foreground">
              Ready to Join Our Community?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Find your perfect student home today.
            </p>
            <Button asChild variant="coral" size="lg" className="mt-6">
              <Link to="/residences">View Residences</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
