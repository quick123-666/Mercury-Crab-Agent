# Enterprise Project Development Process

> Unveiling how large-scale projects are born in big companies

Hello, I'm Yupi.

In previous articles, we learned about the project development process of Vibe Coding and practiced many personal projects. Most of these projects were completed individually, from requirements to design to development to deployment, all controlled by oneself.

But you might wonder: What is the process like for enterprise projects? Especially those projects in big companies with millions of users, how do they differ from the projects we do while learning programming?

Honestly, the difference is huge! Developing projects on your own is a solo effort, where you control your own destiny without dragging down teammates. But developing projects in an enterprise is like teaming up for a raid, where everyone is in the same boat, and each person affects the entire project.

![](https://pic.yupi.icu/5563/202311060822776.png)

I interned at several companies during my university years, and I must say, the development process in big companies is significantly different from others. For most students, if they haven't worked in a big company, many aspects of the development process might be completely unknown.

So, this article aims to unveil the project development process in big companies, helping everyone broaden their horizons. Even if you're currently using Vibe Coding for personal projects, understanding the enterprise development process can make your projects more standardized and professional. Moreover, if you aspire to work in a big company in the future, knowing these processes in advance will make you more competitive.

![](https://pic.yupi.icu/5563/202311060822458.png)

If you want a more intuitive understanding of the project development process in big companies, I highly recommend watching my video: [How Large-Scale Projects Are Made in Big Companies](https://www.bilibili.com/video/BV11q4y1T7kY/). Combining the video with this article will yield better results.

### Full View of the Development Process

To standardize teams and ensure project progress, the development process in big companies is generally quite complex. It can be divided into many stages, summarized in a mind map:

![Enterprise Project Development Process Mind Map](https://pic.yupi.icu/roadmap/enterprise-project-development-process.png)

It's important to note that the above stages are not strictly executed in a top-down order; there may be overlaps between stages. For example, **technology selection** should actually be considered during the **design phase**.

After working formally for over a year, I have experienced the complete development process of multiple projects. Below, I'll take you through it quickly from my perspective.

(To make the content more interesting, the following story contains fictional elements.)

## Requirements Phase

It's Monday, and Yupi rides his electric scooter to the company as usual, unaware that a nightmare is about to begin.

### Requirement Generation

At 10 AM, the product manager approaches Yupi and tells him: After our system went live, users reported that many features are not user-friendly and need major changes.

The boss also approaches Yupi and says: Today, I opened the page and it took more than ten seconds to load. The performance of our system is terrible!

Yupi thinks: Oh no, we're doomed! Probably need to start a new project, and more meetings are coming.

![](https://pic.yupi.icu/5563/202311060822455.png)

Sure enough, soon after, a "Welcome to the Meeting" invitation pops up on the screen.

### Requirement Review

The next morning, the boss, product manager, testers, a few senior developers, and Yupi gather in the meeting room to discuss whether the mentioned requirements are **reasonable and whether they should be implemented**.

The product manager opens a document and says: For this iteration, we need to implement these requirements. Let me explain them in detail, and everyone can evaluate if there are any issues.

### Requirement Analysis

As the product manager continues to elaborate on the screen, one of the senior developers can't hold back.

Senior Developer: This requirement is unreasonable!

Product Manager: Why is it unreasonable? Users have this need!

Senior Developer: I know, but it's impossible to implement!

Thus begins the classic product vs. developer debate...

![](https://pic.yupi.icu/5563/202311060822360.png)

Meanwhile, Yupi is calmly analyzing **how to implement this requirement** in the corner. After a while, he proposes a solution with low impact and quick implementation, ending the debate.

In the AI era, we can also use AI tools (like ChatGPT, Cursor) to assist in requirement analysis, quickly generating multiple technical solutions for comparison, greatly improving the efficiency of requirement analysis.

### Scheduling

After confirming that the requirement is reasonable and feasible, the product manager asks: When can this requirement be launched?

Senior Developer: I'm busy this week, maybe next week.

Product Manager: The users are in a hurry; we need it this week!

Senior Developer: I know, but I can't finish it!

Thus begins the classic product vs. developer debate...

![](https://pic.yupi.icu/5563/202311060822785.png)

Yupi: How about we break this requirement into Feature A and Feature B? I'll complete Feature A this week, and Feature B can be tested next Tuesday and launched next Thursday?

And so, we schedule the completion dates for each requirement one by one.

## Design Phase

Finally, the meeting is over. Looking at the time, it's already time to get off work!

Well, the requirements discussion is done, and the product manager's work is somewhat completed, but Yupi's work is just beginning.

Eager to start coding?

**No, thinking about how to write the code is more important than writing the code itself.**

### Architecture Design

Yupi opens a document editor and a drawing tool, starts organizing the entire system, from the overall structure to the details, designing the system's hierarchical structure, interfaces, and communication methods between layers, important modules within each layer, and the physical deployment methods for each module.

![Architecture Design of the Famous Framework Dubbo](https://pic.yupi.icu/5563/202311060822027.png)

With the help of AI tools, we can now use AI to assist in generating architecture diagrams, analyzing the pros and cons of architecture solutions, and even let AI help us with technical research, greatly improving design efficiency. I recommend watching Yupi's video on [AI Drawing Guide and Tips](https://www.bilibili.com/video/BV1DP7JzAE7k/).

### Outline Design

After completing the architecture design, Yupi starts analyzing the requirements based on the PRD (Product Requirement Document) written by the product manager, organizing the functional modules needed for the system, and then analyzing the sub-modules within each functional module.

Compared to the abstract architecture design, the outline design is more closely related to the requirements and is a refinement of the architecture design.

To put it simply, if you're building a house, the architecture design considers the overall structure, how many floors there are, how the pipes connect on each floor, how many units per floor, how the foundation is laid, etc. The outline design, on the other hand, considers the internal layout of each unit, where the living room is, where the bathroom is, etc.

> In many cases, the outline design and architecture design might be combined into one document, with no clear distinction.

### Detailed Design

After figuring out the system's functionalities, Yupi starts analyzing how each function will be implemented, what algorithms will be used, and what details need attention.

### Solution Alignment

After writing the design document, in the next meeting, Yupi and other developers (front-end, back-end, etc.) discuss the designed solutions, eventually producing a unified solution, and then everyone divides the work.

### Test Case Design

To ensure the system's functionality and stability, testers (or QA) are crucial. For detailed learning on software testing, check out [Software Testing Learning Path](https://www.codefather.cn/course/1789189862986850306/section/1990755616108359682). Testing isn't just clicking around on a webpage like we do in personal projects.

In big companies, to ensure test coverage and improve testing efficiency, test cases are generally designed. For example: When a user clicks "Login" without entering any data, the expected result is to warn the user to enter a username and password.

![Test Case Management](https://pic.yupi.icu/5563/202311060822534.png)

After designing the test cases, they need to be reviewed by other team members, not just the testers. Because one person can easily overlook many testing details, it's best to have developers who are more familiar with the code help supplement them.

Yupi himself wrote a few test cases that might have been missed and confirmed them with the testers, trying to expose issues during the testing phase rather than after deployment.

## Development Preparation

After writing design documents for almost a week, it's finally time to start building the project. But before that, there are still some preparations to be made.

### Technical Research

With technology evolving so rapidly, Yupi first researches the technologies needed or potentially needed for the project.

In the AI era, technical research has become more efficient. We can use AI tools to quickly understand new technologies, compare different solutions, and even let AI generate technical selection reports.

### Technology Selection

Through research, Yupi identifies several technologies that can meet the requirements, but he starts to hesitate: Which one should I use? Should I use the SSM framework or Spring Boot? Should I use the Guava package or Apache Commons?

Yupi opens the document editor again, starts comparing the pros and cons of different technologies, and feels a headache coming on. There are too many factors to consider in technology selection, such as:

- From a technical perspective: performance, ease of use, stability, mainstream status and ecosystem, documentation detail
- Considering the team: team members' familiarity with the technology, mastery level (whether there's someone proficient in the technology)
- Considering the business: whether it fits the business scale (single machine or microservices), whether it fits the business (read-heavy, write-heavy, or analysis-heavy)

For critical projects, Yupi doesn't dare to make the final decision alone. After writing his selection document, he discusses it with colleagues and the leader before finalizing the choice.

### Resource Application

After confirming the technology, resources need to be applied for. For example, Yupi uses a MySQL database, but where does this MySQL come from?

Previously, Yupi would buy a cloud server and set up MySQL himself. But in enterprises, there are usually centralized resource management and allocation platforms. You just fill out the budget on the platform, wait for leadership approval, and then wait for the resources to be allocated. Never use your own or external servers to deploy projects privately; it's not safe!

This time, Yupi directly applied for a cloud database costing over 20,000 yuan per year, which is a great deal.

![](https://pic.yupi.icu/5563/202311060822734.png)

### Environment Preparation

After applying for resources like the database, Yupi sets up a local development environment and a test environment identical to the requested machine versions, so he can connect directly later.

### Project Initialization

With the environment ready, since it's a new project, Yupi needs to create a minimal runnable project demo, using **scaffolding** to automatically generate code instead of starting from scratch, creating files one by one, and manually typing repetitive code.

Now there's a smarter way: using AI tools (like Cursor, GitHub Copilot) to assist in initializing projects and generating template code, saving a lot of time.

### Dependency Installation

After generating the project code, Yupi uses package management tools (front-end yarn/npm, Java Maven/Gradle, etc.) to automatically install dependencies, and then the project demo is ready to run!

## Development Phase

After completing the preliminary preparations, it's finally time for the most familiar part for programmers: writing code, which is also Yupi's favorite part.

![](https://pic.yupi.icu/5563/202311060822531.png)

Because designing the solution requires staying calm and thinking carefully, you can't listen to music while doing it. But once the design is finalized and it's clear what needs to be done, implementing the code is straightforward. At most, you might encounter some pitfalls and need to search online for solutions.

### Local Development

During development, Yupi usually writes code locally first, configuring hot-reload tools to automatically recompile and package the code when it's updated, without manually restarting the project, greatly improving development efficiency.

By the way, enterprise development always uses version control systems like Git. Before starting development, remember to create your own branch and develop on that branch.

### Remote Development

Nowadays, remote development is becoming popular, allowing you to edit remote files as if they were local, directly modifying code on the server. Usually, each developer has their own development machine, and remote development eliminates the hassle of repeatedly deploying and debugging, improving efficiency. Generally, using development tools like VSCode with remote development plugins can achieve this. Yupi previously shared a simple [VSCode Remote Development Hands-on Video](https://www.bilibili.com/video/BV1s64y167cM), which you can check out.

### AI-Assisted Development

In 2025, AI-assisted development has become mainstream. Yupi now often uses AI tools like Cursor and GitHub Copilot when writing code, which can:

- Automatically complete code, improving coding efficiency
- Generate unit tests, ensuring code quality
- Explain complex code, aiding understanding
- Detect potential bugs, providing early warnings
- Refactor and optimize code, enhancing maintainability

I recommend using the tools in the [AI Resource Collection](https://ai.codefather.cn/) to improve development efficiency.

![AI Resource Collection Website](https://pic.yupi.icu/1/AI%E8%B5%84%E6%BA%90%E5%A4%A7%E5%85%A8%E7%BD%91%E7%AB%99.png)

### Code Optimization

While writing code, Yupi always maintains the good habit of actively optimizing code, paying attention to time and space complexity. When repetitive code accumulates, he abstracts it into functions or uses design patterns. Previously, Yupi shared his programming habits in an article: [My Little Stubbornness When Writing Code](https://mp.weixin.qq.com/s?__biz=MzI1NDczNTAwMA==&mid=2247497781&idx=1&sn=9c5ec35cda90ca080ba1dbfa78429275&scene=21#wechat_redirect).

### Unit Testing

Note! Don't think testing is only the tester's job; developers also need to write small-scale tests to take responsibility for their code.

Yupi usually writes unit tests for each database read/write function and business logic function. For Java, tools like JUnit are commonly used, and Jacoco can generate test coverage reports. After modifying critical code, unit tests should be executed to prevent unexpected errors.

![Jacoco Test Coverage Report](https://pic.yupi.icu/5563/202311060822942.png)

Now, AI tools can also automatically generate unit test code, saving a lot of repetitive work.

### Development Integration

Yupi finally completes the back-end code and self-tests it. The next step is to package and build the written code, then publish the executable project package to the test server, integrating with the front-end developer to verify the system's functionality by having them request his interfaces.

## Testing Phase

After Yupi and the front-end developer complete the integration, they inform the testers and product manager.

Testing is a crucial phase in enterprises, often considered the last line of defense. The purpose of testing is to find bugs, identify issues in the system, and eliminate them during the testing phase.

In enterprises, testing can be divided into several types.

### Integration Testing

Integration testing has a larger granularity than unit testing, combining multiple modules or code units to verify the integration and interaction between modules.

Because individual functions might execute correctly, but when multiple functions are combined and called sequentially, issues might arise.

For example, consider a bread-eating system:

Function A: Xiao Yu eats a piece of bread

Function B: Xiao Pi eats a piece of bread

Only one piece of bread is available at a time, and executing Function A and B independently is allowed. But if both are executed together, the latter function will fail.

![](https://pic.yupi.icu/5563/202311060822513.png)

### System Testing

System testing has an even larger granularity, testing the entire system, including not only software but possibly also hardware.

### Product Experience

Besides testers verifying system usability, the product manager also needs to experience whether the functionality meets expectations and is user-friendly. Most of the time, the product manager will suggest modifications during the experience, and developers might need to make further changes.

### Acceptance Testing

Finally, the testers and product manager confirm that there are no issues, and the last step is to have the end-users experience the entire product or feature. Only when the boss/users say it's fine, is it truly fine!

## Submission Phase

After confirming that the system has no issues, Yupi can publish the code to the remote repository, usually using version control systems like Git and SVN.

### Code Submission

Yupi first triggers a code submission locally (`git commit`). To ensure standardization, large projects generally use submission detection plugins (like Husky, pre-commit hooks) to prevent incorrect code from being submitted.

Modern code submissions also automatically trigger:
- Code formatting checks (Prettier, ESLint)
- Unit test execution
- Code style checks (CheckStyle, SonarLint)

### Code Push

The next step is to push the local commit to the remote branch with the same name. Large companies usually have push detection tools to check for code errors, cyclomatic complexity, code style, etc., similar to submission detection, preventing incorrect or non-standard code from being pushed.

### Merge Request

After pushing the code branch to the remote repository, Yupi initiates a branch merge request (MR or PR), hoping to merge the branch's code into the main branch (assuming the code is fine).

![Initiating a New Merge Request](https://pic.yupi.icu/5563/202311060822490.png)

### Code Review

Submitting a merge request doesn't mean it can be merged directly; it needs to pass code review, known as CR (Code Review).

Reviews can be done in two ways: manual review and automated review.

Many students are familiar with manual review, usually conducted by your supervisor and other project leads who read and comment on your code. If everything is fine, they Approve (pass); otherwise, they send it back for revisions.

What is automated review? It's essentially automated checks by machines to ensure your code complies with standards and can be built successfully. This is usually configured by project leads and helps identify issues that humans might miss.

When Yupi first joined a new project, he was often tormented by automated reviews, frequently being flagged for seemingly trivial code issues, like needing to break lines after plus signs or adding empty lines at the end of files. But after paying attention to coding habits, he naturally adapted, which was indeed beneficial.

Now, there are AI Code Review tools that can automatically detect issues in code and suggest optimizations, further improving code quality.

## Release Phase

After