---
title: "motive"
subtitle: "why use an architecture?"
description: "the motive behind creating the Lucid Architecture"
date: 2020-11-30T15:13:44Z
draft: false
---

developing large-scale applications has never been an easy task to begin with, even overwhelming to think about at times.
When it comes to implementation decisions many questions arise while we have very little information about the requirements
and how they will change over time.

pragmatically speaking, in this era our reliance on technology demands change, and thus
change becomes our only constant; none of the features we build today will remain the same in terms of business logic in a few months time.

the least of the questions that wander our thoughts are the following:

- where should this good piece of art code reside (directory, file, class, etc.)?
- how should we apply these sets of design patterns to implement this feature?
- how can you describe (in words) the underlying architecture that's running our application?

asking such questions is a brilliant start.
Knowing that every application begins with a mere idea - a spark - to help fulfil a human function.
Nevertheless, deep in the back of our minds we know that at some point in the future it will grow in requirements and become harder to maintain,
so we start looking for some guidelines and principles that help us contain this growth.

especially in an agile culture where we want the building blocks of our applications to be easily interchangeable with the least friction possible while keeping technical debt to a minimum.

### what is an architecture anyway?

a.k.a Lucid Architecture definition:

**it is a pattern of connected units, cooperating within a set of principles to create a living structure.**

---

here's an illustration that's analogous to our application in a few months time without an architecture.

![Lucid Architecture - Technical Debt - Intertwind classes](/images/composition-intertwined.png)
{{<caption "technical debt due to intertwined object relationships in a legacy application.">}}

instead, with Lucid we strive to reduce complexity into clear and precise composition of objects.

![Lucid Architecture Object Oriented - clear and precise composition of objects](/images/composition-clear.png)
{{<caption "clear and precise composition of objects" >}}


### should you use it?

the following questions ensure that you should incorporate Lucid in your current or upcoming project:

- have you ever been onboarded to a code that is completely custom to the point that it took months to become comfortable contributing to its codebase?
- have you seen a Laravel project, even though it has been provided with Laravel's impeccable simplicity, somehow managed to be ruined by endless whirlpools of huge controllers and deeply dependant classes?
- have you been afraid to break something due to a change you're introducing to an existing codebase, even though tests exist but you're still unsure of the impact?

if your answer to any of the questions above was **yes**, then you should definitely give it a try!
