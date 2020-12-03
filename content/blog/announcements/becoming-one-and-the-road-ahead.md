---
title: "Becoming One - Lucid 1.0 & The Road Ahead"
date: 2020-12-03T21:43:32Z
draft: false
image: "images/blog/pexels-fiona-art-4300128.jpg"
type: "featured"
description: "Lucid v1.0 release - changelog - the road ahead"
---

I cannot believe that it's been 4 years since the inception of Lucid into open source, it feels like yesterday.
Throughout this term we've been launching Lucid •  Laravel applications and the more we use it, the more we know its worth,
especially after a long time passes and we revisit old code only to say "wow, how would we have navigated this project if it weren't for this architecture?",
and we said that countless times.

It is true that Lucid has been in "unstable" mode (version < 1), only because we subconsciously knew that something somewhere needed to change, we just didn't know what it is until a few months back when we started re-evaluating some decisions and identified enhancements that can uplift our codebases. Nevertheless, we've been in production with Lucid since 2015 and it's always been a great success! However, adding features, upgrading Laravel projects and versions has always been a hassle due to the fragmentation of sources:

- `foundation-laravel` and `console-laravel`  are the packages required to get Lucid
- The only way to begin with a Lucid project is to clone a boilerplate from `lucid-architecture/laravel` or `lucid-architecture/laravel-microservice`,
which isn't the best approach compared to requiring a composer package that fits better in the PHP ecosystem for what Lucid is offering

For the TL;DR version head over to the [release Changelog](https://github.com/lucidarch/lucid/releases/tag/v1.0.0), or continue reading to know the story.

## Consolidation

The first step to solve this is to consolidate Lucid's core into a single installable package, now available at [https://github.com/lucidarch/lucid](https://github.com/lucidarch/lucid).

There are several advantages to a single repository:

- Issue tracking: One repository to report issues, ask questions and provide feedback
- Support: as soon as [GitHub discussions](https://github.blog/2020-05-06-new-from-satellite-2020-github-codespaces-github-discussions-securing-code-in-private-repositories-and-more/#discussions) are publicly available it will also be the official forum besides StackOverflow
- Contribution: there will be one repo to star, watch for updates and contribute to, instead of four
- Roadmap: will be also visible in a single place once published

## Package vs. Boilerplate

As expressed previously it is favourable in the PHP ecosystem to provide such offering as a package that you can install rather than a boilerplate,
for the obvious reason that it becomes cumbersome to maintain,
not to mention that it's extremely difficult to include in an existing project without having to plan a codebase migration which causes a halt in the progress that no business is willing to suffer.

On the contrary, adding a package to an existing project and gradually moving pieces is a much smoother experience, and actually a realistic one.

With the new package `lucidarch/lucid` a simple `composer require lucidarch/lucid` would suffice,
be it new or existing, and with the new commands to initialize a variant `init:micro` and `init:monolith` it will be all that's required to scaffold the initial structure.

### Supported Versions

As for supporting several versions, with a package this becomes a breeze, as of the time of this writing  it is supporting
the most recent versions are supported as per the matrix below. See [the docs](https://docs.lucidarch.dev/installation/#versions--compatibility) for the latest compatible versions:

- **Laravel:** **8,** **7,** **6,** **5.5 (LTS)**
- **PHP**: **8.0,** **7.4,** **7.3,** **7.2** , **7.1**

## Knowledge Base

**Documentation** is the number one proponent for a successful open source  project.
Up until this point, the only content has been the readme files of the corresponding repositories,
which covers briefly what Lucid is about and how to use it, but certainly is nowhere near adequate for wide adoption.
The folks who've done it on their own (around 300 that i know of),
I consider them heroes who were able to pick up  the concept with very little information and take it from there on their own.
And as far as I've learned from their feedback, they've astonishingly succeeded! If you're one, I salute you!

The problem is that with little information on how to go about the different cases you may encounter,
we left too much space for imagination in order to understand the intended message.
Therefore, the new thorough documentation is finally in place at: [https://lucidarch.dev](https://lucidarch.dev) and it is just the initial version.
I'll be constantly adding to it the more updates and feedback come in.

**This blog** is also a place to share content about our experience with Lucid so far and as we go,
as well as update announcements and anything that may come in the future.

P.S. Stay tuned for the upgrade guide! Currently being finalised to make is a smooth transition of your applications to Lucid 1.0.

## Modularity

Not everyone wants the same thing, there is no one-size fits all solution to our applications,
and not everyone wants it all every time for every case. So it's been decomposed to become modular and flexible.
Choose whichever pieces of the puzzle that fit you best, and use them. You want Feature and Job only? no services? You got it,
just go head and use the CLI to generate whichever unit from the stack and use it.
Familiarity would still be there since it's the same units that we're used to, only that they might either exist as they should,
or not exist at all. Consistency is key, and with this model it is secured as such.

This approach allows Lucid to be used in an even wider variety of applications that wouldn't have been possible with the boilerplates,
because cloning them meant a commitment to the entire stack and structure,
while our applications require more malleability  since we start small and grow gradually,
and now the architecture will be there for you at every step in the way.

## Cohesion

### With Laravel

At the time of inception, Laravel was at v4, and since then many improvements have been made and were adopted by Lucid (silently),
and the plan is to keep it coherent with Laravel's offering, carefully choosing features to avoid redundancy and confusion,
concentrating on complementing it in any future decision.

### Within

Up until v1 there's been a significant gap between both variants - Micro and Monolith -
specifically that Monolith files have been placed in `/src` as root and the `/app` directory has been slightly neglected.
As for Micro, it is more in accord with Laravel's initial structure at the `/app` directory,
as well as generating Lucid units that's been placed in different locations:

**Previously**

- Data: Micro `app/Data` , Monolith `src/Data`
- Services: Micro `N/A`, Monolith `src/Services`
- Domains: Micro `app/Domains` , Monolith `src/Domains`
- Domain Tests: Micro `tests/Domains/<domain>`, Monolith `src/Domains/<domain>/Tests`

This is no longer the case. The gap between variants have been closed in favour of increased conformity and familiarity with Laravel, and will be the case moving forward.

**Now**

It will be the same for both variants:

- Data: `app/Data`
- Domains: `app/Domains`
- Services: `app/Services`
- Domain Tests: `app/Domains/<domain>/Tests`

This increases the degree of familiarity when working on any of the variants and switching between them,
and most importantly moving an application from one to the other barely requires any cognitive effort.

![Lucid Architecture MVC](/images/blog/announcements/becoming-one/mvc-position.png)

## About Previous Contributions

Open issues from all repositories will be transferred to the new `lucidarch/lucid` repo.

Credit goes to everyone below for contributing; waiting for you in the fresh repo!

### Maintainers

- [Kinane Domloje](https://github.com/KinaneD)
- [Harris Raftopoulos](https://github.com/harris21)

### Contributors

A note on contribution, it is not only done through code, but also in sharing knowledge through blog posts, questions and feedback; keep them coming!

- [Adam van Dongen](https://github.com/websmurf)
- [Adib Hanna](https://github.com/adibhanna)
- [Alex](https://github.com/alexgiuvara)
- [Alexander Diachenko](https://github.com/adiachenko)
- [Ashish Singh](https://github.com/imrealashu)
- [Bert-Jan de Lange](https://github.com/bjdelange)
- [Dmitry Lezhnev](https://github.com/lezhnev74)
- [Dominik Kohler](https://github.com/kohlerdominik)
- [Harald Doderer](https://github.com/haralddoderer)
- [Jesus Baron](https://github.com/jbaron-mx)
- [Jonas Emde](https://github.com/jonasemde)
- [Jose Marques](https://github.com/zeraist)
- [Lazir](https://github.com/Lazir)
- [Lorand Gombos](https://github.com/glorand)
- [Maciej Czerpiński](https://github.com/speccode)
- [Piet de Vries](https://github.com/pietdevries94)
- [Rene Bartkowiak](https://github.com/bart)
- [rzougabenoma](https://github.com/rzougabenoma)
- [Sharik Shaikh](https://github.com/sharik709)
- [Victorien Plancke](https://github.com/vitoo)

I promise you that it hasn't been any easier to work with Lucid and add to or modify it.
Local setup is extremely simple and there's a CI setup to ensure backward compatibility according to the supported version matrix.
In addition to the fact that there will be no confusing branching model in several repositories to deal with,
just a single repository with its release versions. How relieving!

## Identity & Branding

Notice the change in the org username on GitHub, renamed `lucid-architecture` to `lucidarch`.
This change is an identity change to the alias of Lucid Architecture - lucidarch -
where moving forward Lucid's online presence will be (where available) as such "{platform}/lucidarch"
(except for Twitter because it's already taken so there's `lucid_arch` now).

The choice for the alias was straight forward - Lucid Arch - short for architecture, also resembles arches
which in architecture are used to **span an opening and to support loads from above.** Call it a great coincidence, but it also aligns with Lucid's objective.

## The Road Ahead

- Frequent updates: With a single repository it is easier to contribute and thus easier to adopt and provide new releases
- New Laravel features that make sense to have their Lucid counterpart will do so almost instantly,
as well as Laravel updates and upgrades will be available upon release since there will be no boilerplate to prepare
- Enriching the knowledge base will be the utmost priority to try and spread the word about our experience
- Stay tuned for the upgrade guide so that you can transition your existing applications and leverage upcoming updates

## Communication Channels To Tune In To

- [Releases on GitHub](https://github.com/lucidarch/lucid/releases)
- Progress and announcements:
    - [Lucid on Twitter](https://twitter.com/lucid_arch) & my personal account [mulkave](https://twitter.com/mulkave)
    - [Reddit](https://reddit.com/r/lucidarch) in addition to cross posts of interesting content from similar communities
- [dev.to/lucidarch](https://dev.to/lucidarch) for knowledge sharing
- [Slack](https://lucid-slack.herokuapp.com) to gather around the campfire

# Vision
Finally, I would like to close by laying out the vision for Lucid's future.

Fundamentally, Lucid is a mirror of our values; it is to express our fascination by the world of programming and our intention
to contribute parts that can be assembled to create a living structure.
Like seeds turning into a plant, expands from within and gradually complicates itself yet sustains an elegent shape that guides our understanding
and requires the least amount of cognitive effort to comprehend.

The ability to share Lucid code in a "pluggable" way is also in the horizon, because there is so much of what we do that's already been done
and we're also working on similar things at the same time, being able to grab a functionality that you're familiar with its structure
and API effortlessly would make it even easier and faster to assemble.

Most importantly, remember to enjoy the journey!
