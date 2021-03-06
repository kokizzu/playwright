/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CallMetadata } from '../../instrumentation';
import { CallLog, CallLogStatus } from './recorderTypes';

export function metadataToCallLog(metadata: CallMetadata, status: CallLogStatus, snapshots: Set<string>): CallLog {
  const title = metadata.apiName || metadata.method;
  if (metadata.error)
    status = 'error';
  const params = {
    url: metadata.params?.url,
    selector: metadata.params?.selector,
  };
  let duration = metadata.endTime ? metadata.endTime - metadata.startTime : undefined;
  if (typeof duration === 'number' && metadata.pauseStartTime && metadata.pauseEndTime) {
    duration -= (metadata.pauseEndTime - metadata.pauseStartTime);
    duration = Math.max(duration, 0);
  }
  const callLog: CallLog = {
    id: metadata.id,
    messages: metadata.log,
    title,
    status,
    error: metadata.error,
    params,
    duration,
    snapshots: {
      before: showBeforeSnapshot(metadata) && snapshots.has(`before@${metadata.id}`),
      action: showActionSnapshot(metadata) && snapshots.has(`action@${metadata.id}`),
      after: showAfterSnapshot(metadata) && snapshots.has(`after@${metadata.id}`),
    }
  };
  return callLog;
}

function showBeforeSnapshot(metadata: CallMetadata): boolean {
  return metadata.method === 'close';
}

function showActionSnapshot(metadata: CallMetadata): boolean {
  return ['click', 'dblclick', 'check', 'uncheck', 'fill', 'press'].includes(metadata.method);
}

function showAfterSnapshot(metadata: CallMetadata): boolean {
  return ['goto', 'click', 'dblclick', 'dblclick', 'check', 'uncheck', 'fill', 'press'].includes(metadata.method);
}
