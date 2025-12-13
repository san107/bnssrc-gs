'use client';
/**
 * Dynamic script loading hook.
 */
import React, { useState } from 'react';

// If no callback is provided, the script will not be removed on unmount. This
// kinda matters if the script loading is not idempotent (for some reason
// MathJax is not, which is one of the scripts I was using this for) or
// if you need the callback to happen again.
//const useScript = (scriptUrl: string, scriptId: string, callback?: () => void): boolean => {
const useScript = (scriptUrl: string, scriptId: string): boolean => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  React.useEffect(() => {
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptUrl;
      document.body.appendChild(script);

      script.onload = () => {
        script.id = scriptId;
        setScriptLoaded(true);
        // if (callback) {
        //   callback();
        // }
      };
    }

    if (existingScript) {
      setScriptLoaded(true);
      //if (callback) callback();
    }

    // 한번로드하면 스크립트는 삭제하지 않음.
    // return () => {
    //   if (existingScript) {
    //     existingScript.remove();
    //   }
    // };
  }, [scriptUrl, scriptId]);

  return scriptLoaded;
};

export default useScript;

export const useScriptJSMpeg = (): boolean => {
  const scriptLoaded = useScript('/scripts/jsmpeg.min.js', 'jsmpeg.min.js');
  return scriptLoaded;
};
