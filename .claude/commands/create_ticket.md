---
description: Create structured tickets through interactive collaboration
model: sonnet
---

# Create Ticket

You are tasked with creating structured ticket files through an interactive, collaborative process. Work with the user to flesh out requirements, objectives, and success criteria.

## Initial Response

When this command is invoked:

1. **Check if parameters were provided**:
   - If a description or prompt was provided, use it as the starting point
   - If no parameters, ask the user what they want to build

2. **Get the next ticket number**:
   - Run `./bin/weddingplanner tickets next-number` to get the next available number
   - This will be used for the ticket filename

3. **Ask for ticket location**:
   - Personal tickets: `thoughts/[user]/tickets/`
   - Shared tickets: `thoughts/shared/tickets/`
   - Default to personal unless user specifies shared

4. **Start the interactive process**

## Ticket Template

Use this structure for all tickets:

```markdown
# [Title]

## Overview

[Brief description of what we're building and why]

## Objectives

- [Key objective 1]
- [Key objective 2]
- [Key objective 3]

## Functional Requirements

- [ ] [Specific functional requirement 1]
- [ ] [Specific functional requirement 2]
- [ ] [Specific functional requirement 3]

## Non-Functional Requirements

- [ ] [Performance requirement]
- [ ] [Security requirement]
- [ ] [Usability requirement]
- [ ] [Maintainability requirement]

## Success Criteria

- [ ] [How we know the feature is complete]
- [ ] [Measurable outcome]
- [ ] [User acceptance criteria]

## Context & Background

[Any relevant context, history, or background information that helps understand why we're building this]

## Open Questions

- [ ] [Question or investigation needed before implementation]
- [ ] [Uncertainty that needs resolution]

## Related Work

- Implementation plan: [link when created]
- Research: [link when created]
```

## Interactive Workflow

1. **Gather Basic Information**:
   ```
   I'll help you create a new ticket. Let's start with the basics.

   What are you building? (Provide a title and brief overview)
   ```

2. **Determine Location**:
   ```
   Should this be a personal or shared ticket?
   - Personal: Just for your tracking (thoughts/[user]/tickets/)
   - Shared: For the team (thoughts/shared/tickets/)
   ```

3. **Collaborative Fleshing Out**:
   - Work interactively to fill in each section
   - Ask clarifying questions about requirements
   - Help distinguish between functional and non-functional requirements
   - Identify success criteria together
   - Document open questions and uncertainties

4. **Create the Ticket**:
   - Get ticket number: `./bin/weddingplanner tickets next-number`
   - Create structure: `./bin/weddingplanner tickets create [NUM] [personal|shared]`
   - Write the ticket file
   - Confirm creation and show location

5. **Next Steps**:
   ```
   ✅ Ticket created at:
   - tickets/[NUM]/ticket.md
   - Symlinked from thoughts/[location]/tickets/[NUM].md

   Next steps:
   - Run `/create_plan tickets/[NUM]/ticket.md` to create an implementation plan
   - Add any supporting files to tickets/[NUM]/ directory
   - Use `/research_codebase` if you need to understand existing code first
   ```

## Important Guidelines

1. **Be Collaborative**:
   - Don't write the full ticket in one shot
   - Work section by section
   - Ask questions to clarify requirements
   - Help the user think through edge cases

2. **Be Specific**:
   - Functional requirements should be concrete and testable
   - Success criteria should be measurable
   - Non-functional requirements should have targets (e.g., "Response time < 200ms")

3. **Be Practical**:
   - Keep objectives focused (3-5 max)
   - Don't over-specify details that should be in the implementation plan
   - Document what you DON'T know in Open Questions

4. **Track Progress**:
   - Use TodoWrite to track ticket creation steps if the process is complex
   - Mark sections complete as you fill them in

## Example Interaction Flow

```
User: /create_ticket
Assistant: I'll help you create a new ticket. Let's start with the basics.

What are you building? (Provide a title and brief overview)

User: A video filtering system to identify hype moments in volleyball footage
Assistant: Great! Let me gather some more details...

Should this be a personal or shared ticket?

User: Shared
Assistant: Perfect. Let's flesh out the requirements.

What are the key objectives for this feature? What do you want to achieve?

[Interactive process continues...]
```
