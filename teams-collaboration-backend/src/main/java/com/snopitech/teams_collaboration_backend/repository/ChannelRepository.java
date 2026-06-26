package com.snopitech.teams_collaboration_backend.repository;

import com.snopitech.teams_collaboration_backend.model.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    
    List<Channel> findByTeamId(Long teamId);
    
    List<Channel> findByTeamIdAndType(Long teamId, String type);
}
