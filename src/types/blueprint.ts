// Core type definitions for Vibe Architect's Semantic JSON Blueprint

export interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
  isMvp: boolean;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowNode {
  id: string;
  type: 'screen' | 'action' | 'decision' | 'start' | 'end';
  label: string;
  description?: string;
  linkedStoryIds: string[];
  position: { x: number; y: number };
  data?: Record<string, unknown>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'navigation' | 'conditional' | 'action';
}

export interface DataEntity {
  id: string;
  name: string;
  attributes: EntityAttribute[];
  position: { x: number; y: number };
}

export interface EntityAttribute {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'reference' | 'array';
  required: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referenceTo?: string;
}

export interface EntityRelationship {
  id: string;
  sourceEntity: string;
  targetEntity: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  label?: string;
}

export interface WireframeComponent {
  id: string;
  type: 'navbar' | 'sidebar' | 'data-table' | 'form' | 'card' | 'list' | 'button' | 'input' | 'chart' | 'modal' | 'text' | 'image' | 'container';
  label: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  props?: Record<string, unknown>;
  children?: string[];
  linkedEntityId?: string;
  linkedStoryIds?: string[];
}

export interface Screen {
  id: string;
  name: string;
  path: string;
  description?: string;
  components: WireframeComponent[];
  linkedStoryIds: string[];
  linkedFlowNodeId?: string;
}

export interface Blueprint {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Phase 1: Stories
  rawPrd: string;
  stories: UserStory[];
  
  // Phase 2: Architecture
  userFlow: {
    nodes: FlowNode[];
    edges: FlowEdge[];
  };
  dataModel: {
    entities: DataEntity[];
    relationships: EntityRelationship[];
  };
  
  // Phase 3: Design
  screens: Screen[];
}

export interface ExportManifest {
  name: string;
  version: string;
  generatedAt: string;
  mvpStoryCount: number;
  screenCount: number;
  entityCount: number;
  files: string[];
}

export type Phase = 'stories' | 'architecture' | 'design' | 'export';

export interface AppState {
  currentPhase: Phase;
  blueprint: Blueprint;
  selectedStoryId: string | null;
  selectedNodeId: string | null;
  selectedScreenId: string | null;
  isAiProcessing: boolean;
  aiError: string | null;
}
