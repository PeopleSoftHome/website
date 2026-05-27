-- CreateIndex
CREATE INDEX "blog_posts_authorId_idx" ON "blog_posts"("authorId");

-- CreateIndex
CREATE INDEX "blog_posts_categoryId_idx" ON "blog_posts"("categoryId");

-- CreateIndex
CREATE INDEX "forum_posts_topicId_idx" ON "forum_posts"("topicId");

-- CreateIndex
CREATE INDEX "forum_posts_authorId_idx" ON "forum_posts"("authorId");

-- CreateIndex
CREATE INDEX "forum_topics_categoryId_idx" ON "forum_topics"("categoryId");

-- CreateIndex
CREATE INDEX "forum_topics_authorId_idx" ON "forum_topics"("authorId");

-- CreateIndex
CREATE INDEX "products_tabId_idx" ON "products"("tabId");

-- CreateIndex
CREATE INDEX "products_isPublished_idx" ON "products"("isPublished");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "resources_categoryId_idx" ON "resources"("categoryId");

-- CreateIndex
CREATE INDEX "resources_status_idx" ON "resources"("status");
