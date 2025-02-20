import antfu from '@antfu/eslint-config'

export default antfu(
  {
    lessOpinionated: true,
    rules: {
      'no-console': 'warn',
    },
  },
)
