import axios from "axios";
import { config } from "../config/config";

const OPENAI_ENDPOINT = `${config.azureOpenAiUrl}/openai/deployments/reverse-engineering-gpt4o/chat/completions?api-version=2025-01-01-preview`;

type MermaidDiagramType =
    | "sequence"
    | "flowchart"
    | "class"
    | "state"
    | "er"
    | "gantt"
    | "pie"
    | "mindmap"
    | "timeline"
    | "journey"
    | "requirement"
    | "git";

const mermaidExamples: Record<MermaidDiagramType, string> = {
    flowchart: `flowchart TD
    Start([Start Process]) --> Decision{Is user logged in?}
    Decision -- Yes --> Dashboard[Show Dashboard]
    Decision -- No --> Login[Prompt Login]

    Login --> Validate[Validate Credentials]
    Validate -->|Success| Dashboard
    Validate -->|Fail| Error[Show Error Message]

    Dashboard --> ChooseAction{Select Action}
    ChooseAction --> ViewData[View Data]
    ChooseAction --> UpdateSettings[Update Settings]

    subgraph External API
        APIRequest[Send API Request] --> APIResponse[Receive Response]
    end

    UpdateSettings --> APIRequest
    APIResponse --> Dashboard

    ViewData --> End([End Process])
    APIResponse --> End`,

    sequence: `sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database

    Note over User, Browser: User initiates login request

    User->>+Browser: Enter credentials
    Browser->>+Server: Send credentials
    Server->>+Database: Query user by credentials
    Database-->>-Server: User data

    alt Credentials valid
        Server-->>Browser: Success token
        Browser-->>User: Logged in
    else Credentials invalid
        Server-->>Browser: Error message
        Browser-->>User: Show error
    end

    Note over Server: Token is JWT, valid for 15 min

    User->>+Browser: Click "Fetch profile"
    Browser->>+Server: Request /profile with token
    Server->>+Database: Fetch user profile
    Database-->>-Server: Profile data
    Server-->>-Browser: Return profile
    Browser-->>User: Render profile

    Note over all: End of session`,

    class: `classDiagram
    %% General animal hierarchy
    class Animal {
        +int age
        +String gender
        +eat()
        +sleep()
    }

    class Mammal {
        +boolean hasFur
        +giveBirth()
    }

    class Bird {
        +boolean hasFeathers
        +layEggs()
    }

    Animal <|-- Mammal
    Animal <|-- Bird

    %% Duck-specific implementation
    class Duck {
        +String beakColor
        +quack()
        +swim()
        +fly()
    }

    Bird <|-- Duck

    %% Association with Zoo
    class Zoo {
        +List<Animal> animals
        +addAnimal(Animal)
        +removeAnimal(Animal)
    }

    Zoo --> Animal : contains

    %% Interface and implementation
    class CanFly {
        <<interface>>
        +fly()
    }

    Duck ..|> CanFly`,

    state: `stateDiagram-v2
    [*] --> Idle

    Idle --> Authenticating : login requested
    Authenticating --> AuthSuccess : credentials valid
    Authenticating --> AuthFailed : credentials invalid
    AuthFailed --> Idle : retry

    AuthSuccess --> LoadingDashboard
    LoadingDashboard --> Ready

    Ready --> Editing : user clicks edit
    Editing --> Previewing : toggle preview
    Previewing --> Editing : back to edit
    Editing --> Saving : user clicks save
    Saving --> Ready

    Ready --> LoggingOut : user logs out
    LoggingOut --> [*]

    note right of Authenticating : Validating credentials
    note right of LoggingOut : Clearing session and redirect`,

    er: `erDiagram
    CUSTOMER {
        string name
        string email
        string phone
    }

    ADDRESS {
        string street
        string city
        string country
        int postalCode
    }

    ORDER {
        int orderNumber
        date orderDate
        float totalAmount
    }

    ORDER_ITEM {
        int quantity
        float price
    }

    PRODUCT {
        string name
        string description
        float price
    }

    PAYMENT {
        string method
        date paymentDate
        float amount
    }

    INVOICE {
        int invoiceNumber
        date issuedDate
        float totalDue
    }

    SHIPMENT {
        string carrier
        date shippedDate
        string trackingNumber
    }

    CUSTOMER ||--o{ ORDER : places
    CUSTOMER }|..|{ ADDRESS : has
    ORDER ||--|{ ORDER_ITEM : includes
    ORDER_ITEM ||--|| PRODUCT : contains
    ORDER ||--o{ PAYMENT : paid_with
    ORDER ||--o{ SHIPMENT : ships_with
    INVOICE ||--|{ ORDER : covers
    CUSTOMER ||--o{ INVOICE : "billed via"
    SHIPMENT ||--|| ADDRESS : delivers_to`,

    gantt: `gantt
    title Website Redesign Project Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Planning
    Project kickoff           :done,    kickoff,    2025-01-01, 1d
    Requirements gathering    :active,  reqs,       2025-01-02, 5d
    Stakeholder interviews    :         interviews, after reqs, 3d

    section Design
    Wireframes                :         wireframes, 2025-01-10, 5d
    Visual design             :         visuals,    after wireframes, 6d
    Design review             :         review,     2025-01-20, 1d

    section Development
    Frontend setup            :crit,    frontend,   2025-01-22, 3d
    Backend setup             :crit,    backend,    2025-01-22, 4d
    Integration               :         integration,after frontend, 3d
    Testing                   :         test,       after integration, 4d

    section Launch
    Final review              :milestone, reviewDone, 2025-02-05, 0d
    Launch                    :active,   launch,     after reviewDone, 1d`,

    pie: `pie title Distribution of Monthly Expenses
    "Rent" : 1200
    "Groceries" : 450
    "Utilities" : 200
    "Transportation" : 150
    "Internet & Phone" : 100
    "Leisure & Entertainment" : 300
    "Insurance" : 180
    "Savings" : 420`,

    mindmap: `mindmap
  root((Project X))

    Planning
      Define scope
      Identify stakeholders
      Set deadlines

    Research
      Market analysis
      Competitor study
        SWOT analysis
        Feature comparison

    Development
      Frontend
        Vue.js
        Tailwind CSS
      Backend
        Node.js
        PostgreSQL
      DevOps
        CI/CD
        Monitoring

    Marketing
      Strategy
        Social Media
        Email Campaigns
      Assets
        Logo
        Landing Page

    Launch
      Beta release
      Feedback collection
      Final release

    ::icon(fa fa-rocket)`,

    timeline: `timeline
    title Evolution of Product X

    section Concept Phase
    Idea proposed         : 2022-01-15
    Initial brainstorming : 2022-02-01

    section Research & Planning
    Market analysis       : 2022-03-10
    Feasibility study     : 2022-04-05

    section Development
    MVP design finalized  : 2022-06-01
    MVP development start : 2022-06-15
    MVP completed         : 2022-08-30

    section Testing & Feedback
    Internal testing      : 2022-09-10
    Beta launch           : 2022-10-01
    Feedback collected    : 2022-10-20

    section Launch
    Final release         : 2022-12-01
    Post-launch review    : 2023-01-15`,

    journey: `journey
    title User Journey: Booking a Flight

    section Search
      Open flight website     : 5: User
      Enter destination       : 4: User
      View search results     : 3: User

    section Selection
      Filter results          : 3: User
      Choose flight           : 4: User

    section Booking
      Enter passenger details : 3: User
      Add extras              : 2: User
      Payment process         : 2: User

    section Post-booking
      Confirmation received   : 4: User
      Email notification      : 5: System`,

    requirement: ` requirementDiagram

    requirement test_req {
    id: 1
    text: the test text.
    risk: high
    verifymethod: test
    }

    functionalRequirement test_req2 {
    id: 1.1
    text: the second test text.
    risk: low
    verifymethod: inspection
    }

    performanceRequirement test_req3 {
    id: 1.2
    text: the third test text.
    risk: medium
    verifymethod: demonstration
    }

    interfaceRequirement test_req4 {
    id: 1.2.1
    text: the fourth test text.
    risk: medium
    verifymethod: analysis
    }

    physicalRequirement test_req5 {
    id: 1.2.2
    text: the fifth test text.
    risk: medium
    verifymethod: analysis
    }

    designConstraint test_req6 {
    id: 1.2.3
    text: the sixth test text.
    risk: medium
    verifymethod: analysis
    }

    element test_entity {
    type: simulation
    }

    element test_entity2 {
    type: word doc
    docRef: reqs/test_entity
    }

    element test_entity3 {
    type: "test suite"
    docRef: github.com/all_the_tests
    }


    test_entity - satisfies -> test_req2
    test_req - traces -> test_req2
    test_req - contains -> test_req3
    test_req3 - contains -> test_req4
    test_req4 - derives -> test_req5
    test_req5 - refines -> test_req6
    test_entity3 - verifies -> test_req5
    test_req <- copies - test_entity2`,


    git: `gitGraph
    commit tag: "Initial commit"
    commit tag: "Set up project structure"
    branch feature/login
    checkout feature/login
    commit tag: "Add login form"
    commit tag: "Integrate with backend"
    checkout main
    merge feature/login tag: "Merge login feature"
    branch feature/profile
    checkout feature/profile
    commit tag: "Add profile page"
    commit tag: "Connect to user data"
    checkout main
    merge feature/profile tag: "Merge profile feature"
    commit tag: "Release v1.0"`,
};

export const getMermaidText = async (description: string, diagramType: MermaidDiagramType) => {
    const mermaidText = await callOpenAiMermaidPrompt(description, diagramType);
    return {
        mermaidText: mermaidText.trim()
    };
};

async function callOpenAiMermaidPrompt(description: string, diagramType: MermaidDiagramType): Promise<string> {
    const example = mermaidExamples[diagramType];

    const systemMessage = `You are a helpful assistant that only generates Mermaid.js diagram syntax.
Respond ONLY with a code block using the Mermaid syntax, with no explanation or commentary.
Diagram type: ${diagramType}

Here is an example for "${diagramType}":
\`\`\`mermaid
${example}
\`\`\``;

    const userPrompt = `Create a Mermaid "${diagramType}" diagram based on the following scenario or data:
${description}`;

    const payload = {
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userPrompt }
        ]
    };

    const response = await axios.post(OPENAI_ENDPOINT, payload, {
        headers: {
            "api-key": config.azureOpenAiKey,
            "Content-Type": "application/json",
        },
    });

    const content = response.data.choices?.[0]?.message?.content ?? "";

    return content
        .replace(/```(mermaid)?/g, "")
        .trim();
}
