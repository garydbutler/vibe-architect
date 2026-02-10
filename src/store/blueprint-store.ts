'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Blueprint, 
  UserStory, 
  FlowNode, 
  FlowEdge, 
  DataEntity, 
  EntityRelationship,
  Screen,
  WireframeComponent,
  Phase 
} from '@/types/blueprint';

interface BlueprintStore {
  // Current state
  currentPhase: Phase;
  blueprint: Blueprint;
  selectedStoryId: string | null;
  selectedNodeId: string | null;
  selectedEntityId: string | null;
  selectedScreenId: string | null;
  isAiProcessing: boolean;
  aiError: string | null;

  // Phase navigation
  setPhase: (phase: Phase) => void;
  
  // Blueprint management
  createNewBlueprint: (name: string) => void;
  updateBlueprintName: (name: string) => void;
  setRawPrd: (prd: string) => void;

  // Story management
  addStory: (story: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStory: (id: string, updates: Partial<UserStory>) => void;
  deleteStory: (id: string) => void;
  toggleMvp: (id: string) => void;
  setStories: (stories: UserStory[]) => void;
  selectStory: (id: string | null) => void;

  // Flow management
  addFlowNode: (node: Omit<FlowNode, 'id'>) => void;
  updateFlowNode: (id: string, updates: Partial<FlowNode>) => void;
  deleteFlowNode: (id: string) => void;
  addFlowEdge: (edge: Omit<FlowEdge, 'id'>) => void;
  updateFlowEdge: (id: string, updates: Partial<FlowEdge>) => void;
  deleteFlowEdge: (id: string) => void;
  setFlowNodes: (nodes: FlowNode[]) => void;
  setFlowEdges: (edges: FlowEdge[]) => void;
  selectNode: (id: string | null) => void;

  // Entity management
  addEntity: (entity: Omit<DataEntity, 'id'>) => void;
  updateEntity: (id: string, updates: Partial<DataEntity>) => void;
  deleteEntity: (id: string) => void;
  addRelationship: (rel: Omit<EntityRelationship, 'id'>) => void;
  updateRelationship: (id: string, updates: Partial<EntityRelationship>) => void;
  deleteRelationship: (id: string) => void;
  setEntities: (entities: DataEntity[]) => void;
  setRelationships: (relationships: EntityRelationship[]) => void;
  selectEntity: (id: string | null) => void;

  // Screen management
  addScreen: (screen: Omit<Screen, 'id'>) => void;
  updateScreen: (id: string, updates: Partial<Screen>) => void;
  deleteScreen: (id: string) => void;
  addComponent: (screenId: string, component: Omit<WireframeComponent, 'id'>) => void;
  updateComponent: (screenId: string, componentId: string, updates: Partial<WireframeComponent>) => void;
  deleteComponent: (screenId: string, componentId: string) => void;
  setScreens: (screens: Screen[]) => void;
  selectScreen: (id: string | null) => void;

  // AI state
  setAiProcessing: (isProcessing: boolean) => void;
  setAiError: (error: string | null) => void;

  // Get MVP stories only
  getMvpStories: () => UserStory[];
}

const createEmptyBlueprint = (name: string = 'Untitled Project'): Blueprint => ({
  id: uuidv4(),
  name,
  version: '1.0.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  rawPrd: '',
  stories: [],
  userFlow: {
    nodes: [],
    edges: [],
  },
  dataModel: {
    entities: [],
    relationships: [],
  },
  screens: [],
});

export const useBlueprintStore = create<BlueprintStore>()(
  persist(
    (set, get) => ({
      currentPhase: 'stories',
      blueprint: createEmptyBlueprint(),
      selectedStoryId: null,
      selectedNodeId: null,
      selectedEntityId: null,
      selectedScreenId: null,
      isAiProcessing: false,
      aiError: null,

      setPhase: (phase) => set({ currentPhase: phase }),

      createNewBlueprint: (name) => set({ 
        blueprint: createEmptyBlueprint(name),
        selectedStoryId: null,
        selectedNodeId: null,
        selectedEntityId: null,
        selectedScreenId: null,
        currentPhase: 'stories',
      }),

      updateBlueprintName: (name) => set((state) => ({
        blueprint: { ...state.blueprint, name, updatedAt: new Date() }
      })),

      setRawPrd: (prd) => set((state) => ({
        blueprint: { ...state.blueprint, rawPrd: prd, updatedAt: new Date() }
      })),

      addStory: (story) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          stories: [...state.blueprint.stories, {
            ...story,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }],
          updatedAt: new Date(),
        }
      })),

      updateStory: (id, updates) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          stories: state.blueprint.stories.map(s => 
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
          updatedAt: new Date(),
        }
      })),

      deleteStory: (id) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          stories: state.blueprint.stories.filter(s => s.id !== id),
          updatedAt: new Date(),
        },
        selectedStoryId: state.selectedStoryId === id ? null : state.selectedStoryId,
      })),

      toggleMvp: (id) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          stories: state.blueprint.stories.map(s => 
            s.id === id ? { ...s, isMvp: !s.isMvp, updatedAt: new Date() } : s
          ),
          updatedAt: new Date(),
        }
      })),

      setStories: (stories) => set((state) => ({
        blueprint: { ...state.blueprint, stories, updatedAt: new Date() }
      })),

      selectStory: (id) => set({ selectedStoryId: id }),

      addFlowNode: (node) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          userFlow: {
            ...state.blueprint.userFlow,
            nodes: [...state.blueprint.userFlow.nodes, { ...node, id: uuidv4() }],
          },
          updatedAt: new Date(),
        }
      })),

      updateFlowNode: (id, updates) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          userFlow: {
            ...state.blueprint.userFlow,
            nodes: state.blueprint.userFlow.nodes.map(n => 
              n.id === id ? { ...n, ...updates } : n
            ),
          },
          updatedAt: new Date(),
        }
      })),

      deleteFlowNode: (id) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          userFlow: {
            nodes: state.blueprint.userFlow.nodes.filter(n => n.id !== id),
            edges: state.blueprint.userFlow.edges.filter(e => e.source !== id && e.target !== id),
          },
          updatedAt: new Date(),
        },
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      })),

      addFlowEdge: (edge) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          userFlow: {
            ...state.blueprint.userFlow,
            edges: [...state.blueprint.userFlow.edges, { ...edge, id: uuidv4() }],
          },
          updatedAt: new Date(),
        }
      })),

      updateFlowEdge: (id, updates) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          userFlow: {
            ...state.blueprint.userFlow,
            edges: state.blueprint.userFlow.edges.map(e => 
              e.id === id ? { ...e, ...updates } : e
            ),
          },
          updatedAt: new Date(),
        }
      })),

      deleteFlowEdge: (id) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          userFlow: {
            ...state.blueprint.userFlow,
            edges: state.blueprint.userFlow.edges.filter(e => e.id !== id),
          },
          updatedAt: new Date(),
        }
      })),

      setFlowNodes: (nodes) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          userFlow: { ...state.blueprint.userFlow, nodes },
          updatedAt: new Date(),
        }
      })),

      setFlowEdges: (edges) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          userFlow: { ...state.blueprint.userFlow, edges },
          updatedAt: new Date(),
        }
      })),

      selectNode: (id) => set({ selectedNodeId: id }),

      addEntity: (entity) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          dataModel: {
            ...state.blueprint.dataModel,
            entities: [...state.blueprint.dataModel.entities, { ...entity, id: uuidv4() }],
          },
          updatedAt: new Date(),
        }
      })),

      updateEntity: (id, updates) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          dataModel: {
            ...state.blueprint.dataModel,
            entities: state.blueprint.dataModel.entities.map(e => 
              e.id === id ? { ...e, ...updates } : e
            ),
          },
          updatedAt: new Date(),
        }
      })),

      deleteEntity: (id) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          dataModel: {
            entities: state.blueprint.dataModel.entities.filter(e => e.id !== id),
            relationships: state.blueprint.dataModel.relationships.filter(
              r => r.sourceEntity !== id && r.targetEntity !== id
            ),
          },
          updatedAt: new Date(),
        },
        selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
      })),

      addRelationship: (rel) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          dataModel: {
            ...state.blueprint.dataModel,
            relationships: [...state.blueprint.dataModel.relationships, { ...rel, id: uuidv4() }],
          },
          updatedAt: new Date(),
        }
      })),

      updateRelationship: (id, updates) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          dataModel: {
            ...state.blueprint.dataModel,
            relationships: state.blueprint.dataModel.relationships.map(r => 
              r.id === id ? { ...r, ...updates } : r
            ),
          },
          updatedAt: new Date(),
        }
      })),

      deleteRelationship: (id) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          dataModel: {
            ...state.blueprint.dataModel,
            relationships: state.blueprint.dataModel.relationships.filter(r => r.id !== id),
          },
          updatedAt: new Date(),
        }
      })),

      setEntities: (entities) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          dataModel: { ...state.blueprint.dataModel, entities },
          updatedAt: new Date(),
        }
      })),

      setRelationships: (relationships) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          dataModel: { ...state.blueprint.dataModel, relationships },
          updatedAt: new Date(),
        }
      })),

      selectEntity: (id) => set({ selectedEntityId: id }),

      addScreen: (screen) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          screens: [...state.blueprint.screens, { ...screen, id: uuidv4() }],
          updatedAt: new Date(),
        }
      })),

      updateScreen: (id, updates) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          screens: state.blueprint.screens.map(s => 
            s.id === id ? { ...s, ...updates } : s
          ),
          updatedAt: new Date(),
        }
      })),

      deleteScreen: (id) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          screens: state.blueprint.screens.filter(s => s.id !== id),
          updatedAt: new Date(),
        },
        selectedScreenId: state.selectedScreenId === id ? null : state.selectedScreenId,
      })),

      addComponent: (screenId, component) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          screens: state.blueprint.screens.map(s => 
            s.id === screenId 
              ? { ...s, components: [...s.components, { ...component, id: uuidv4() }] }
              : s
          ),
          updatedAt: new Date(),
        }
      })),

      updateComponent: (screenId, componentId, updates) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          screens: state.blueprint.screens.map(s => 
            s.id === screenId 
              ? { 
                  ...s, 
                  components: s.components.map(c => 
                    c.id === componentId ? { ...c, ...updates } : c
                  )
                }
              : s
          ),
          updatedAt: new Date(),
        }
      })),

      deleteComponent: (screenId, componentId) => set((state) => ({
        blueprint: {
          ...state.blueprint,
          screens: state.blueprint.screens.map(s => 
            s.id === screenId 
              ? { ...s, components: s.components.filter(c => c.id !== componentId) }
              : s
          ),
          updatedAt: new Date(),
        }
      })),

      setScreens: (screens) => set((state) => ({
        blueprint: { ...state.blueprint, screens, updatedAt: new Date() }
      })),

      selectScreen: (id) => set({ selectedScreenId: id }),

      setAiProcessing: (isProcessing) => set({ isAiProcessing: isProcessing }),
      setAiError: (error) => set({ aiError: error }),

      getMvpStories: () => get().blueprint.stories.filter(s => s.isMvp),
    }),
    {
      name: 'vibe-architect-blueprint',
    }
  )
);
