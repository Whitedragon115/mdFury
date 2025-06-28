/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'rgb(59 130 246)',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            '[class~="lead"]': {
              color: 'inherit',
            },
            strong: {
              color: 'inherit',
              fontWeight: '600',
            },
            'ol[type="A"]': {
              '--list-counter-style': 'upper-alpha',
            },
            'ol[type="a"]': {
              '--list-counter-style': 'lower-alpha',
            },
            'ol[type="A" s]': {
              '--list-counter-style': 'upper-alpha',
            },
            'ol[type="a" s]': {
              '--list-counter-style': 'lower-alpha',
            },
            'ol[type="I"]': {
              '--list-counter-style': 'upper-roman',
            },
            'ol[type="i"]': {
              '--list-counter-style': 'lower-roman',
            },
            'ol[type="I" s]': {
              '--list-counter-style': 'upper-roman',
            },
            'ol[type="i" s]': {
              '--list-counter-style': 'lower-roman',
            },
            'ol[type="1"]': {
              '--list-counter-style': 'decimal',
            },
            'ol > li': {
              position: 'relative',
            },
            'ol > li::before': {
              content: 'counter(list-item, var(--list-counter-style, decimal)) "."',
              position: 'absolute',
              fontWeight: '400',
              color: 'rgb(107 114 128)',
              left: '0',
            },
            'ul > li': {
              position: 'relative',
            },
            'ul > li::before': {
              content: '""',
              position: 'absolute',
              backgroundColor: 'rgb(209 213 219)',
              borderRadius: '50%',
              width: '0.375rem',
              height: '0.375rem',
              top: 'calc(0.875rem - 0.1875rem)',
              left: '0.25rem',
            },
            hr: {
              borderColor: 'rgb(229 231 235)',
              borderTopWidth: 1,
              marginTop: '3rem',
              marginBottom: '3rem',
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'inherit',
              borderLeftWidth: '0.25rem',
              borderLeftColor: 'rgb(229 231 235)',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
              marginTop: '1.6rem',
              marginBottom: '1.6rem',
              paddingLeft: '1rem',
            },
            h1: {
              color: 'inherit',
              fontWeight: '800',
              fontSize: '2.25rem',
              marginTop: '0',
              marginBottom: '0.8888889rem',
              lineHeight: '1.1111111',
            },
            h2: {
              color: 'inherit',
              fontWeight: '700',
              fontSize: '1.5rem',
              marginTop: '2rem',
              marginBottom: '1rem',
              lineHeight: '1.3333333',
            },
            h3: {
              color: 'inherit',
              fontWeight: '600',
              fontSize: '1.25rem',
              marginTop: '1.6rem',
              marginBottom: '0.6rem',
              lineHeight: '1.6',
            },
            h4: {
              color: 'inherit',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              lineHeight: '1.5',
            },
            'figure figcaption': {
              color: 'rgb(107 114 128)',
              fontSize: '0.875rem',
              lineHeight: '1.4285714',
              marginTop: '0.8571429rem',
            },
            code: {
              color: 'rgb(59 130 246)',
              fontWeight: '600',
              fontSize: '0.875rem',
              backgroundColor: 'rgb(243 244 246)',
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              paddingTop: '0.125rem',
              paddingBottom: '0.125rem',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            pre: {
              color: 'rgb(229 231 235)',
              backgroundColor: 'rgb(31 41 55)',
              overflowX: 'auto',
              fontSize: '0.875rem',
              lineHeight: '1.7142857',
              marginTop: '1.7142857rem',
              marginBottom: '1.7142857rem',
              borderRadius: '0.375rem',
              paddingTop: '0.8571429rem',
              paddingRight: '1.1428571rem',
              paddingBottom: '0.8571429rem',
              paddingLeft: '1.1428571rem',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: '400',
              color: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
            },
            table: {
              width: '100%',
              tableLayout: 'auto',
              textAlign: 'left',
              marginTop: '2rem',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              lineHeight: '1.7142857',
            },
            thead: {
              color: 'inherit',
              fontWeight: '600',
              borderBottomWidth: '1px',
              borderBottomColor: 'rgb(209 213 219)',
            },
            'thead th': {
              verticalAlign: 'bottom',
              paddingRight: '0.5714286rem',
              paddingBottom: '0.5714286rem',
              paddingLeft: '0.5714286rem',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: 'rgb(229 231 235)',
            },
            'tbody tr:last-child': {
              borderBottomWidth: '0',
            },
            'tbody td': {
              verticalAlign: 'top',
              paddingTop: '0.5714286rem',
              paddingRight: '0.5714286rem',
              paddingBottom: '0.5714286rem',
              paddingLeft: '0.5714286rem',
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': 'rgb(229 231 235)',
            '--tw-prose-headings': 'rgb(255 255 255)',
            '--tw-prose-lead': 'rgb(156 163 175)',
            '--tw-prose-links': 'rgb(147 197 253)',
            '--tw-prose-bold': 'rgb(255 255 255)',
            '--tw-prose-counters': 'rgb(156 163 175)',
            '--tw-prose-bullets': 'rgb(75 85 99)',
            '--tw-prose-hr': 'rgb(55 65 81)',
            '--tw-prose-quotes': 'rgb(243 244 246)',
            '--tw-prose-quote-borders': 'rgb(55 65 81)',
            '--tw-prose-captions': 'rgb(156 163 175)',
            '--tw-prose-code': 'rgb(147 197 253)',
            '--tw-prose-pre-code': 'rgb(229 231 235)',
            '--tw-prose-pre-bg': 'rgb(17 24 39)',
            '--tw-prose-th-borders': 'rgb(75 85 99)',
            '--tw-prose-td-borders': 'rgb(55 65 81)',
            code: {
              backgroundColor: 'rgb(55 65 81)',
              color: 'rgb(147 197 253)',
            },
            'ul > li::before': {
              backgroundColor: 'rgb(75 85 99)',
            },
            'ol > li::before': {
              color: 'rgb(156 163 175)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
