#!/usr/bin/env python3
"""将后端硬编码中文错误信息批量替换为英文。"""
import os
import re
from pathlib import Path

ROOT = Path('D:/14vibecoding/kimicode/09ningpu/np-website/talentpro-backend/apps/api/src')

REPLACEMENTS = [
    # 长的优先
    ('媒体文件不存在或无权访问', 'Media file not found or no access'),
    ('文章不存在或无权访问', 'Post not found or no access'),
    ('回复不存在或无权访问', 'Reply not found or no access'),
    ('职位不存在或已关闭', 'Job not found or closed'),
    ('用户不存在或已被禁用', 'User not found or disabled'),
    ('邀请码无效或已过期', 'Invalid or expired invitation code'),
    ('邮箱或密码错误', 'Invalid email or password'),
    ('默认角色不存在，请先运行 seed', 'Default role does not exist, please run seed first'),
    ('该应用已在工作空间安装', 'This app is already installed in the workspace'),
    ('该用户已是该工作空间成员', 'This user is already a workspace member'),
    ('开发登录仅在 development 环境可用', 'Dev login is only available in development environment'),
    ('reCAPTCHA 验证失败，请重试', 'reCAPTCHA verification failed, please try again'),
    ('安全验证未通过，请重试', 'Security verification failed, please try again'),
    ('缺少 reCAPTCHA 验证令牌', 'Missing reCAPTCHA token'),
    ('缺少刷新令牌', 'Missing refresh token'),
    ('话题已锁定，无法回复', 'Topic is locked, cannot reply'),
    ('邀请已发送，等待用户注册', 'Invitation sent, waiting for user registration'),
    ('权限不足，需要角色: ', 'Insufficient permissions, required roles: '),
    ('权限不足', 'Insufficient permissions'),
    ('删除成功', 'Deleted successfully'),
    ('预约记录不存在', 'Booking record not found'),
    ('不支持的生成类型', 'Unsupported generation type'),
    ('媒体文件不存在', 'Media file not found'),
    ('案例不存在', 'Case not found'),
    ('用户不存在', 'User not found'),
    ('邮箱已被注册', 'Email already registered'),
    ('文章不存在', 'Post not found'),
    ('资源不存在', 'Resource not found'),
    ('应用不存在', 'App not found'),
    ('订阅不存在', 'Subscription not found'),
    ('话题不存在', 'Topic not found'),
    ('回复不存在', 'Reply not found'),
    ('账号已被禁用', 'Account is disabled'),
    ('更新成功', 'Updated successfully'),
    ('注册成功', 'Registered successfully'),
    ('邀请成功', 'Invitation successful'),
    ('无权操作该工作空间', 'No permission to operate this workspace'),
    ('需要管理员权限', 'Admin permission required'),
]


def replace_in_file(path: Path) -> int:
    text = path.read_text(encoding='utf-8')
    original = text
    for cn, en in REPLACEMENTS:
        text = text.replace(cn, en)
    if text != original:
        path.write_text(text, encoding='utf-8')
        return 1
    return 0


def main():
    changed = 0
    for path in ROOT.rglob('*.ts'):
        changed += replace_in_file(path)
    print(f'Changed {changed} files')


if __name__ == '__main__':
    main()
