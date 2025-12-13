import React from 'react';

//  HTML 문자열을 렌더링하기 위한 함수
export const renderHtml = (html: string | undefined | null): React.ReactElement => {
  if (!html) return React.createElement(React.Fragment);

  // 기본적인 HTML 태그만 허용
  const allowedTags = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'div', 'span', 'ul', 'ol', 'li'];

  // HTML 문자열을 파싱하여 허용된 태그만 사용
  const sanitizedHtml = html.replace(/<[^>]*>/g, (match) => {
    const tag = match.match(/<\/?([a-z0-9]+)/i)?.[1]?.toLowerCase();
    return allowedTags.includes(tag || '') ? match : '';
  });

  return React.createElement('div', { dangerouslySetInnerHTML: { __html: sanitizedHtml } });
};
