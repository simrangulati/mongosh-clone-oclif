import {expect, test} from '@oclif/test'

describe('use', () => {
  test
  .stdout()
  .command(['use', 'test-db'])
  .it('runs use command', ctx => {
    expect(ctx.stdout).to.contain('test-db')
  })
}) 