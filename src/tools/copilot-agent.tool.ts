/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as msal from '@azure/msal-node'
import { Activity, ActivityTypes, CardAction } from '@microsoft/agents-activity'
import { ConnectionSettings, loadCopilotStudioConnectionSettingsFromEnv, CopilotStudioClient } from '@microsoft/agents-copilotstudio-client'
// @ts-ignore
import pkg from '@microsoft/agents-copilotstudio-client/package.json' with { type: 'json' }
import readline from 'readline'
import open from 'open'
import os from 'os'
import path from 'path'

import { MsalCachePlugin } from './msalCachePlugin.js'

async function acquireToken (settings: ConnectionSettings): Promise<string> {
    const msalConfig = {
        auth: {
            clientId: settings.appClientId,
            authority: `https://login.microsoftonline.com/${settings.tenantId}`,
        },
        cache: {
            cachePlugin: new MsalCachePlugin(path.join(os.tmpdir(), 'mcssample.tockencache.json'))
        },
        system: {
            loggerOptions: {
                loggerCallback (loglevel: msal.LogLevel, message: string, containsPii: boolean) {
                    if (!containsPii) {
                        console.log(loglevel, message)
                    }
                },
                piiLoggingEnabled: false,
                logLevel: msal.LogLevel.Verbose,
            }
        }
    }
    const pca = new msal.PublicClientApplication(msalConfig)
    const tokenRequest = {
        scopes: ['https://api.powerplatform.com/.default'],
        redirectUri: 'http://localhost',
        openBrowser: async (url: string) => {
            await open(url)
        }
    }
    let token
    try {
        const accounts = await pca.getAllAccounts()
        if (accounts.length > 0) {
            const response2 = await pca.acquireTokenSilent({ account: accounts[0], scopes: tokenRequest.scopes })
            token = response2.accessToken
        } else {
            const response = await pca.acquireTokenInteractive(tokenRequest)
            token = response.accessToken
        }
    } catch (error) {
        console.error('Error acquiring token interactively:', error)
        const response = await pca.acquireTokenInteractive(tokenRequest)
        token = response.accessToken
    }
    return token
}

export const createClient = async (): Promise<CopilotStudioClient> => {
    const settings = loadCopilotStudioConnectionSettingsFromEnv()
    const token = await acquireToken(settings)
    const copilotClient = new CopilotStudioClient(settings, token)
    console.log(`Copilot Studio Client Version: ${pkg.version}, running with settings: ${JSON.stringify(settings, null, 2)}`)
    return copilotClient
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

export const askQuestion = async (
    copilotClient: CopilotStudioClient,
    conversationId: string,
    question: string
): Promise<string[]> => {
    if (
        question.toLowerCase() === 'exit' ||
        question.toLowerCase() === 'quit' ||
        question.toLowerCase() === 'bye'
    ) {
        return ['Goodbye!']
    }

    const replies = await copilotClient.askQuestionAsync(question, conversationId)

    const responses: string[] = []
    let conversationEnded = false

    replies.forEach((act: Activity) => {
        if (act.type === ActivityTypes.Message) {
            if (act.text) {
                responses.push(act.text)
            }

            if (act.suggestedActions?.actions?.length) {
                const suggestions = act.suggestedActions.actions.map(
                    (action: CardAction) => action.title || action.value
                )
                responses.push(`Suggested actions: ${suggestions.join(', ')}`)
            }
        } else if (act.type === ActivityTypes.EndOfConversation) {
            responses.push('[Conversation ended]')
            if (act.text) {
                responses.push(act.text)
            }
            conversationEnded = true
        }
    })

    if (!responses.length && replies.length > 0) {
        responses.push('[Copilot acknowledged but returned no visible response]')
    }

    if (conversationEnded) {
        responses.push('Conversation completed. Goodbye!')
    }

    return responses
}
