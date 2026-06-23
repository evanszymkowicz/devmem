# Test Action

1. Read current-feature.md to understand what was implemented
2. Identify server actions and utility functions added/modified for this feature
3. Check if tests already exist for these functions
4. For functions without tests that have testable logic, write unit tests:
   - Create unit tests using Vitest
   - Focus on server actions and utilities (not components)
   - Test happy path and error cases
   - Do not write tests just to write them. They should serve a purpose
   - Place test files next to the module: `src/actions/foo.test.ts` tests `src/actions/foo.ts`
   - Mock all external dependencies (prisma, auth, third-party clients) with `vi.mock()` — never hit real DB or network
   - `vi.mock()` is hoisted before imports, so the `prisma.ts` startup guard won't throw even without a `.env`
   - Use `vi.clearAllMocks()` in `beforeEach` when multiple tests share mocked modules
   - Cast mocked return values with `as never` when TypeScript overloads make direct typing awkward (e.g. `auth()`)
5. Run `npm test` to verify all tests pass
6. Run `npm run build` and fix any errors
7. Verify the feature works in the browser
8. Notes and screenshots are captured ONLY during this step, following the `.playwright-mcp/` sub-directory convention in the Workflow Test step of `context/ai-interaction.md`.
9. Report test coverage for the new feature code