package com.snopitech.teams_collaboration_backend.repository;

import com.snopitech.teams_collaboration_backend.model.ChannelMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChannelMemberRepository extends JpaRepository<ChannelMember, Long> {
    
    List<ChannelMember> findByChannelId(Long channelId);
    
    List<ChannelMember> findByUserId(Long userId);
    
    Optional<ChannelMember> findByChannelIdAndUserId(Long channelId, Long userId);
    
    boolean existsByChannelIdAndUserId(Long channelId, Long userId);
}