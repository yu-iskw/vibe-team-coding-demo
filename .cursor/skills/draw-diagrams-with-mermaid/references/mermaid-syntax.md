# Mermaid Syntax Examples

Basic examples of Mermaid syntax for different chart types. **All node labels must be double-quoted.**

## Flowchart

```mermaid
graph TD
    A["Start"] --> B{"Is it?"}
    B -- "Yes" --> C["OK"]
    B -- "No" --> D["Not OK"]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    Alice->>Bob: "Hello Bob, how are you?"
    Bob-->>Alice: "I am good thanks!"
```

## Class Diagram

```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int "age"
    Animal : +String "gender"
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String "beakColor"
        +swim()
        +quack()
    }
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
```

## Gantt Chart

```mermaid
gantt
    title "A Gantt Diagram"
    dateFormat  YYYY-MM-DD
    section "Section"
    "A task"           :a1, 2014-01-01, 30d
    "Another task"     :after a1  , 20d
    section "Another"
    "Task in Another"  :2014-01-12  , 12d
    "another task"      : 24d
```

## Entity Relationship Diagram

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--|{ LINE-ITEM : "contains"
    CUSTOMER }|..|{ DELIVERY-ADDRESS : "uses"
```

## More documentation

Visit [Mermaid.js documentation](https://mermaid.js.org/) for more details.
