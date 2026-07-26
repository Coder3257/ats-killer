// Static mapping of ATS-relevant skills to verified learning resources
export const SKILL_RESOURCE_MAP: Record<string, { title: string; url: string }> = {
  // Programming Languages
  "JavaScript": { title: "JavaScript.info - Modern JavaScript Tutorial", url: "https://javascript.info/" },
  "TypeScript": { title: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/" },
  "Python": { title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/" },
  "Java": { title: "Java Tutorials - Oracle", url: "https://docs.oracle.com/javase/tutorial/" },
  "C#": { title: "C# Guide - Microsoft", url: "https://learn.microsoft.com/en-us/dotnet/csharp/" },

  // Frontend Frameworks/Libraries
  "React": { title: "React Official Documentation", url: "https://react.dev/learn" },
  "Vue.js": { title: "Vue.js Official Guide", url: "https://vuejs.org/guide/" },
  "Angular": { title: "Angular Documentation", url: "https://angular.io/docs" },
  "Svelte": { title: "Svelte Tutorial", url: "https://svelte.dev/tutorial" },

  // backend/frameworks
  "Node.js": { title: "Node.js Guides", url: "https://nodejs.org/en/docs/guides" },
  "Express.js": { title: "Express.js Guide", url: "https://expressjs.com/en/starter/installing.html" },
  "Django": { title: "Django Official Documentation", url: "https://docs.djangoproject.com/en/stable/" },
  "FastAPI": { title: "FastAPI Tutorial", url: "https://fastapi.tiangolo.com/tutorial/" },
  "Spring Boot": { title: "Spring Guide - Getting Started", url: "https://spring.io/guides/gs/spring-boot/" },

  // Databases
  "SQL": { title: "SQLBolt - Learn SQL Interactive", url: "https://sqlbolt.com/" },
  "PostgreSQL": { title: "PostgreSQL Tutorial", url: "https://www.postgresql.org/docs/" },
  "MySQL": { title: "MySQL Tutorial", url: "https://www.mysqltutorial.org/" },
  "MongoDB": { title: "MongoDB University - Free Courses", url: "https://university.mongodb.com/" },
  "Redis": { title: "Redis Getting Started", url: "https://redis.io/docs/getting-started/" },

  // Cloud & DevOps
  "AWS": { title: "AWS Training and Certification - Free Digital Training", url: "https://explore.skillbuilder.aws/learn" },
  "Azure": { title: "Microsoft Learn - Azure Fundamentals", url: "https://learn.microsoft.com/en-us/training/azure/" },
  "Google Cloud": { title: "Google Cloud Skills Boost", url: "https://www.cloudskillsboost.google/" },
  "Docker": { title: "Docker Get Started Guide", url: "https://docs.docker.com/get-started/" },
  "Kubernetes": { title: "Kubernetes Basics - Interactive Tutorial", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
  "Jenkins": { title: "Jenkins Tutorial - TutorialsPoint", url: "https://www.tutorialspoint.com/jenkins/index.htm" },

  // Testing
  "Jest": { title: "Jest Official Documentation", url: "https://jestjs.io/docs/getting-started" },
  "Cypress": { title: "Cypress.io - Getting Started", url: "https://docs.cypress.io/guides/overview/why-cypress" },
  "Selenium": { title: "Selenium Documentation", url: "https://www.selenium.dev/documentation/" },

  // Data Science/Analytics
  "Machine Learning": { title: "Machine Learning Crash Course - Google", url: "https://developers.google.com/machine-learning/crash-course" },
  "Data Analysis": { title: "Kaggle Learn - Data Analysis", url: "https://www.kaggle.com/learn" },
  "SQL Analysis": { title: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/" },

  // Project Management/Methodologies
  "Agile": { title: "Atlassian Agile Coach", url: "https://www.atlassian.com/agile" },
  "Scrum": { title: "Scrum Guides", url: "https://scrumguides.org/" },
  "Kanban": { title: "Atlassian Kanban Guide", url: "https://www.atlassian.com/kanban" },

  // Other Common Skills
  "Git": { title: "Git Handbook - GitHub Guides", url: "https://guides.github.com/introduction/git-handbook/" },
  "Linux": { title: "Linux Journey", url: "https://linuxjourney.com/" },
  "REST APIs": { title: "REST API Design Rulebook", url: "https://apihandyman.io/writing-a-node-js-rest-api/" },
  "GraphQL": { title: "GraphQL Official Tutorial", url: "https://graphql.org/learn/" }
};