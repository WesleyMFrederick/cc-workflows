---
title: "Specification Vs. Requirement: Reqs and Specs | Pragmatic Institute"
source: "https://www.pragmaticinstitute.com/resources/articles/product/on-reqs-and-specs/?utm_source=perplexity"
author:
  - "[[Pragmatic Editorial Team]]"
  - "[[View all posts]]"
published: 2009-09-15
created: 2025-11-29
description: "Developers say they cannot program to product management's requirements. And they're right. What they need is a functional specification."
tags:
  - "clippings"
---
Can you believe the angst between product managers and developers? Many product managers think their developers are incompetent. The feeling is mutual: developers don’t think product managers bring any value to the process. Yet we all want to get products to market but our understanding of roles keeps getting in the way. Who writes requirements? Who writes specifications? And what’s the difference between a req and a spec?

## The requirement is the problem

Product managers write terrible requirements, littered with buzz words, ambivalent language, non-specific performance parameters. They read like somewhat-technical marketing hype. And developers have to make sense of the requirements. They complain, ‘I cannot program to these requirements.’

And they’re right.

So product managers try to become more specific by writing what I call ReqSpecs. Part problem, part implementation–and impossible to use. Developers complain ‘don’t tell me how to do my job’ because the requirement now explains how the feature should be implemented.

And they’re right again.

The primary role of the product manager is to be the ‘messenger of the market’ (reference: [Role of Product Management](https://www.pragmaticinstitute.com/resources/articles/product/Role-of-Product-Management "Role of Product Management")), and we must not take on additional tasks until that primary one is completed. Yet product managers frequently attend design meetings. Why? What value do they add? If product managers have time for design meetings, it had better be after they have completed their on-site visits with their market segment.

Besides, product management attending design meetings is not about getting better designed products; it’s about sharing blame for poor design. ‘What do you mean you don’t like it? You were there when we designed it!?!?!’ If product managers are creating the design, what value is development providing? Coding? If that’s all, perhaps we should just fire all the developers and outsource to India or Ireland or someplace where at least they will code to our design. That is, we’ll get exactly what we asked for without the developer’s editorial license.

Developers say they cannot program to product management’s requirements. And they’re right. What they need is a functional specification. ReqSpecs don’t solve the problem.

Let’s clarify some terms.

- A requirement is short statement of the problem.
- A specification is how to solve the problem.

[Alan Cooper](http://www.cooper.com/) argues that most projects fail because they do not have a spec at all. This is because most companies do not have product designers or architects. Product managers create desired feature lists. Developers write code. But no one is designing anything. Would you hire a carpenter to build the house? Of course not. You would hire an architect! Yet programmers write complex software products without a design. So Cooper suggests that we add a role that is new to most development organizations: the **product architect**. The architect analyzes the problems that are described in the requirements and then creates a specification, at a functional level, how the problem can be solved with the product. The architect delivers a recommended approach to solving the problem, serving as the bridge between product management and development.

In Pragmatic Institute’s course [Build](https://www.pragmaticinstitute.com/course/product/build/), we teach product managers how to log market problems, distill them into the unique set of problems, and write requirements based on the market problems. Our Market Requirements Document (MRD) is a master list of all problems and the number of customer and prospect sites reporting the problem. Developers value the class as much as the product managers because eliminating dysfunction by teaching product management to deliver what developers so desperately want to know: what are the problems in the market?

## The problem is the requirement

By definition, a requirement is implementation-free; that is, absent design. When developers request more specific implementation details, they’re asking for a specification instead of a requirement. In eXtreme Programming (XP), a requirement fits on an index card and is delivered in the form of a story. The requirement is also an explicit ‘agreement to discuss’ so that developers fully understand the problem.

Instead of being in the requirement, implementation details must be in the specification. A specification is the *architect’s intended implementation* to solve the problem. It is not an architectural blueprint of the final product.

Joel Spolsky has already written much of what I would write on specs. (I encourage you to spend some time reading the articles at [Joel on Software](http://www.joelonsoftware.com/). I defy you to find an article that doesn’t have at least one tip on creating better products.) He writes:

*‘On any non-trivial project (more than about 1 week of coding or more than 1 programmer), if you don’t have a spec, you will always spend more time and create lower quality code.’ Source: [http://www.joelonsoftware.com/articles/fog0000000036.html](http://www.joelonsoftware.com/articles/fog0000000036.html)*

*‘A functional specification describes how a product will work entirely from the user’s perspective. It doesn’t care how the thing is implemented. It talks about features. It specifies screens, menus, dialogs, and so on. A technical specification describes the internal implementation of the program. It talks about data structures, relational database models, choice of programming languages and tools, algorithms, etc.’ Source: [http://www.joelonsoftware.com/articles/fog0000000034.html](http://www.joelonsoftware.com/articles/fog0000000034.html)*

So a requirement states the problem. A specification states the solution. Joel defines two kinds of specification: functional, which is the intended approach to solving the problem, and technical, which is a detailed internal implementation.

In the end, we all have a critical role to play:

- the *product manager* finds and quantifies market problems, articulating them in the form of requirements
- the *product architect* (or designer) writes a functional specification describing the approach to solving the problem
- the *product developer* creates a technical specification that fully describes how the functional specification will be implemented

Think developers are incompetent? Maybe they’re working in a dysfunctional environment and are frustrated themselves. Focus on market problems and you’re halfway to a reasonable solution. Design a reasonable solution to the problem and you’ll deliver a product that people want to buy.