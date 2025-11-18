/**
 * Node Type Value Object
 * Represents the different types of nodes in a learning path
 */

export enum NodeType {
  START = 'START',
  END = 'END',
  COURSE = 'COURSE',
  DECISION = 'DECISION',
  SYNC = 'SYNC',
}

export class NodeTypeVO {
  private constructor(private readonly _value: NodeType) {}

  get value(): NodeType {
    return this._value;
  }

  static create(value: string): NodeTypeVO {
    if (!Object.values(NodeType).includes(value as NodeType)) {
      throw new Error(`Invalid node type: ${value}`);
    }
    return new NodeTypeVO(value as NodeType);
  }

  equals(other: NodeTypeVO): boolean {
    return this._value === other._value;
  }

  isCourse(): boolean {
    return this._value === NodeType.COURSE;
  }

  isDecision(): boolean {
    return this._value === NodeType.DECISION;
  }

  isSync(): boolean {
    return this._value === NodeType.SYNC;
  }

  isStart(): boolean {
    return this._value === NodeType.START;
  }

  isEnd(): boolean {
    return this._value === NodeType.END;
  }

  toString(): string {
    return this._value;
  }
}
