import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiUser, FiThumbsUp, FiMessageSquare, FiShare2, FiZap, FiTag } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
export function ResearchPostCard(_a) {
    var post = _a.post, onLike = _a.onLike, onBoost = _a.onBoost, onClick = _a.onClick;
    var id = post.id, title = post.title, content = post.content, created_at = post.created_at, tags = post.tags, is_boosted = post.is_boosted, engagement_count = post.engagement_count, profiles = post.profiles;
    var createdAt = created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : '';
    var fullName = profiles ? "".concat(profiles.first_name, " ").concat(profiles.last_name) : 'Unknown User';
    var institution = (profiles === null || profiles === void 0 ? void 0 : profiles.institution) || 'Independent Researcher';
    var userId = profiles === null || profiles === void 0 ? void 0 : profiles.id;
    // Truncate content if it's too long
    var truncatedContent = content.length > 300
        ? "".concat(content.substring(0, 300), "...")
        : content;
    return (<Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 space-y-4">
        {/* Post header with user info */}
        <div className="flex items-center space-x-3">
          <Link href={"/profile/".concat(userId)} className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {(profiles === null || profiles === void 0 ? void 0 : profiles.avatar_url) ? (<img src={profiles.avatar_url} alt={fullName} className="h-full w-full object-cover"/>) : (<FiUser className="text-primary-600" size={20}/>)}
            </div>
          </Link>
          
          <div className="flex-1 min-w-0">
            <Link href={"/profile/".concat(userId)} className="hover:underline">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {fullName}
              </p>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {institution} • {createdAt}
            </p>
          </div>
          
          {is_boosted && (<div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center text-xs font-medium dark:bg-yellow-900/30 dark:text-yellow-400">
              <FiZap size={12} className="mr-1"/>
              Boosted
            </div>)}
        </div>
        
        {/* Post content */}
        <div>
          <Link href={"/research/".concat(id)} onClick={onClick}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400">
              {title}
            </h3>
          </Link>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {truncatedContent}
          </p>
          {content.length > 300 && (<Link href={"/research/".concat(id)} className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Read more
            </Link>)}
        </div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (<div className="flex flex-wrap gap-2">
            {tags.map(function (tag) { return (<Link key={tag} href={"/research?tag=".concat(encodeURIComponent(tag))} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md flex items-center hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                <FiTag size={12} className="mr-1"/>
                {tag}
              </Link>); })}
          </div>)}
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" onClick={function () { return onLike === null || onLike === void 0 ? void 0 : onLike(id); }} className="text-gray-600 dark:text-gray-400">
            <FiThumbsUp size={16} className="mr-1"/>
            <span>{engagement_count}</span>
          </Button>
          
          <Link href={"/research/".concat(id)} passHref>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
              <FiMessageSquare size={16} className="mr-1"/>
              <span>Comment</span>
            </Button>
          </Link>
          
          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400" onClick={function () {
            navigator.clipboard.writeText("".concat(window.location.origin, "/research/").concat(id));
        }}>
            <FiShare2 size={16} className="mr-1"/>
            <span>Share</span>
          </Button>
          
          {!is_boosted && (<Button variant="ghost" size="sm" className="text-yellow-600 dark:text-yellow-400" onClick={function () { return onBoost === null || onBoost === void 0 ? void 0 : onBoost(id); }}>
              <FiZap size={16} className="mr-1"/>
              <span>Boost</span>
            </Button>)}
        </div>
      </CardFooter>
    </Card>);
}
