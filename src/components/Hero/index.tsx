import React from 'react';

interface HeroProps {
  heading: string;
  subheading?: string;
  image?: string;
  ctaButton?: {
    label: string;
    url: string;
  };
}

const Hero: React.FC<HeroProps> = ({ heading, subheading, image, ctaButton }) => {
  return (
    <div className="relative py-16 md:py-24 bg-gray-100" data-sb-object-id="hero">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900" 
            data-sb-field-path="heading"
          >
            {heading}
          </h1>
          
          {subheading && (
            <p 
              className="text-xl md:text-2xl mb-8 text-gray-600" 
              data-sb-field-path="subheading"
            >
              {subheading}
            </p>
          )}
          
          {ctaButton && (
            <a 
              href={ctaButton.url} 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              data-sb-field-path="ctaButton"
            >
              <span data-sb-field-path=".label">{ctaButton.label}</span>
            </a>
          )}
        </div>
      </div>
      
      {image && (
        <div className="mt-12 max-w-4xl mx-auto">
          <img 
            src={image} 
            alt={heading} 
            className="w-full h-auto rounded-lg shadow-xl" 
            data-sb-field-path="image"
          />
        </div>
      )}
    </div>
  );
};

export default Hero;