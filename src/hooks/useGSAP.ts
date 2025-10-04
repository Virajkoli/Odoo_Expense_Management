"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const useGSAPAnimation = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  const fadeIn = (delay = 0, duration = 0.8) => {
    if (elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration, delay, ease: "power3.out" }
      );
    }
  };

  const slideInLeft = (delay = 0, duration = 0.8) => {
    if (elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, x: -100 },
        { opacity: 1, x: 0, duration, delay, ease: "power3.out" }
      );
    }
  };

  const slideInRight = (delay = 0, duration = 0.8) => {
    if (elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, x: 100 },
        { opacity: 1, x: 0, duration, delay, ease: "power3.out" }
      );
    }
  };

  const scaleIn = (delay = 0, duration = 0.6) => {
    if (elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration, delay, ease: "power3.out" }
      );
    }
  };

  const staggerChildren = (delay = 0, stagger = 0.1) => {
    if (elementRef.current) {
      const children = elementRef.current.children;
      gsap.fromTo(
        children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay,
          stagger,
          ease: "power3.out",
        }
      );
    }
  };

  const hoverScale = () => {
    if (elementRef.current) {
      const element = elementRef.current;

      element.addEventListener("mouseenter", () => {
        gsap.to(element, { scale: 1.05, duration: 0.3, ease: "power2.out" });
      });

      element.addEventListener("mouseleave", () => {
        gsap.to(element, { scale: 1, duration: 0.3, ease: "power2.out" });
      });
    }
  };

  const floatingAnimation = () => {
    if (elementRef.current) {
      gsap.to(elementRef.current, {
        y: -10,
        duration: 2,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });
    }
  };

  const pulseAnimation = () => {
    if (elementRef.current) {
      gsap.to(elementRef.current, {
        scale: 1.05,
        opacity: 0.8,
        duration: 1.5,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });
    }
  };

  return {
    elementRef,
    fadeIn,
    slideInLeft,
    slideInRight,
    scaleIn,
    staggerChildren,
    hoverScale,
    floatingAnimation,
    pulseAnimation,
  };
};

export const animateElements = (
  selector: string,
  animation: string,
  delay = 0
) => {
  const elements = document.querySelectorAll(selector);

  switch (animation) {
    case "fadeIn":
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
      break;
    case "slideInLeft":
      gsap.fromTo(
        elements,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
      break;
    case "slideInRight":
      gsap.fromTo(
        elements,
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
      break;
    case "scaleIn":
      gsap.fromTo(
        elements,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
      break;
  }
};
