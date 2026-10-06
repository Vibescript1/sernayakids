import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    // Scroll html document container
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    // Scroll body container
    document.body.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, search]);

  return null;
}
