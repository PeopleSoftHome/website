// 前端 API 层类型定义（JSDoc 补充用）
// 本文件不引入 TypeScript 编译，仅作为 VSCode 智能提示和文档参考

/**
 * @typedef {Object} ApiResponse
 * @property {number} status
 * @property {any} data
 * @property {string} [message]
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {any[]} items
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalPages
 */

/**
 * @typedef {Object} BlogPost
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} content
 * @property {string} summary
 * @property {string} coverImage
 * @property {string[]} tags
 * @property {string} authorId
 * @property {string} workspaceId
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} ForumTopic
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string} category
 * @property {string} authorId
 * @property {string} workspaceId
 * @property {number} viewCount
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} ForumPost
 * @property {string} id
 * @property {string} content
 * @property {string} topicId
 * @property {string} authorId
 * @property {string} [parentId]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} NotificationItem
 * @property {string} id
 * @property {string} type
 * @property {string} title
 * @property {string} content
 * @property {boolean} isRead
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} avatar
 * @property {string} role
 * @property {string} [workspaceId]
 */

/**
 * @typedef {Object} AuthTokens
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {Date} expiresAt
 */

/**
 * @typedef {Object} DemoBooking
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} company
 * @property {string} jobTitle
 * @property {Date} preferredDate
 * @property {string} status
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id
 * @property {string} type
 * @property {string} title
 * @property {string} description
 * @property {string} url
 * @property {number} score
 */

export {};
