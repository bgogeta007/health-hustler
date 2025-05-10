import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Award, Heart, Clock, ArrowRight } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            About HealthHustler
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We're on a mission to make personalized nutrition and fitness accessible to everyone,
            empowering you to take control of your health journey.
          </motion.p>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              HealthHustler was born from a simple observation: health and wellness advice is 
              often generic, overwhelming, and inaccessible to many people.
            </p>
            <p className="text-gray-600 mb-4">
              We believe that everyone deserves personalized guidance for their unique health journey. 
              Our team of nutrition experts, fitness professionals, and health enthusiasts came 
              together to create a platform that delivers customized plans without the premium price tag.
            </p>
            <p className="text-gray-600">
              Today, HealthHustler helps thousands of people discover diet and fitness approaches 
              tailored to their specific needs, goals, and preferences—all completely free.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative h-80 rounded-xl overflow-hidden"
          >
            <img 
              src="https://images.pexels.com/photos/3823207/pexels-photo-3823207.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Our team" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do at HealthHustler.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8 text-green-500" />,
                title: 'Personalization',
                description: 'We believe in tailored approaches that consider your unique needs, preferences, and goals.'
              },
              {
                icon: <Award className="h-8 w-8 text-blue-500" />,
                title: 'Scientific Integrity',
                description: 'Our recommendations are based on current scientific research and evidence-based practices.'
              },
              {
                icon: <Heart className="h-8 w-8 text-red-500" />,
                title: 'Inclusivity',
                description: 'We create resources that are accessible to everyone, regardless of fitness level or background.'
              },
              {
                icon: <Clock className="h-8 w-8 text-purple-500" />,
                title: 'Sustainability',
                description: 'We focus on long-term health rather than quick fixes that don\'t last.'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="rounded-full bg-gray-50 w-16 h-16 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Expert Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the professionals behind HealthHustler's personalized plans.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Emily Chen',
                role: 'Nutrition Specialist',
                bio: 'With over 10 years of experience in clinical nutrition, Dr. Chen helps develop our personalized diet plans.',
                image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=600'
              },
              {
                name: 'James Wilson',
                role: 'Certified Fitness Coach',
                bio: 'Former professional athlete with a passion for helping people find exercise routines they actually enjoy.',
                image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600'
              },
              {
                name: 'Maria Rodriguez',
                role: 'Wellness Psychologist',
                bio: 'Specializes in the psychology of habit formation and sustainable behavioral change for long-term health.',
                image: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=600'
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-64 relative">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-green-500 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-green-500 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Health Journey?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Take our quiz to get your personalized diet and weight loss plan, tailored to your unique needs and preferences.
          </p>
          <Link 
            to="/quiz" 
            className="inline-flex items-center px-6 py-3 bg-white text-green-500 font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300"
          >
            Take the Quiz <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;